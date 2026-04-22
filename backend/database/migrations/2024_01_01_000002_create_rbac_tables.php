<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('module');
            $table->string('resource');
            $table->string('action');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique(['module', 'resource', 'action']);
            $table->index(['module', 'resource']);
        });

        Schema::create('user_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('group_id');
            $table->uuid('assigned_by');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'group_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('role_id');
            $table->uuid('assigned_by');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'role_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('group_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('group_id');
            $table->uuid('role_id');
            $table->uuid('assigned_by');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['group_id', 'role_id']);
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id');
            $table->uuid('permission_id');
            $table->uuid('assigned_by');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['role_id', 'permission_id']);
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
        });
    }

    public function down(): void {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('group_roles');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('user_groups');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('roles');
    }
};
