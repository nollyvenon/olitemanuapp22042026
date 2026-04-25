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
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->uuid('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->uuid('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            $table->uuid('assigned_by')->nullable()->references('id')->on('users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('group_roles', function (Blueprint $table) {
            $table->uuid('group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->uuid('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->primary(['group_id', 'role_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('group_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('roles');
    }
};
