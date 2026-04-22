<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_sub_admin')->default(false);
            $table->boolean('force_password_reset')->default(false);
            $table->uuid('created_by')->nullable()->references('id')->on('users');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable()->references('id')->on('users');
            $table->timestamps();
        });

        Schema::create('group_inheritance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('child_group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->uuid('parent_group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->unique(['child_group_id', 'parent_group_id']);
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('module');
        });

        Schema::create('group_permissions', function (Blueprint $table) {
            $table->uuid('group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->uuid('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            $table->primary(['group_id', 'permission_id']);
        });

        Schema::create('user_groups', function (Blueprint $table) {
            $table->uuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->uuid('group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->uuid('assigned_by')->nullable()->references('id')->on('users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->primary(['user_id', 'group_id']);
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country');
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('long', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_locations', function (Blueprint $table) {
            $table->uuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->uuid('location_id')->references('id')->on('locations')->cascadeOnDelete();
            $table->primary(['user_id', 'location_id']);
        });

        Schema::create('group_locations', function (Blueprint $table) {
            $table->uuid('group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->uuid('location_id')->references('id')->on('locations')->cascadeOnDelete();
            $table->primary(['group_id', 'location_id']);
        });

        Schema::create('device_registry', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->references('id')->on('users');
            $table->string('fingerprint');
            $table->text('user_agent')->nullable();
            $table->string('os')->nullable();
            $table->string('browser')->nullable();
            $table->timestamp('first_seen_at')->useCurrent();
            $table->timestamp('last_seen_at')->useCurrent();
            $table->boolean('is_trusted')->default(false);
            $table->unique(['user_id', 'fingerprint']);
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->references('id')->on('users');
            $table->uuid('device_id')->references('id')->on('device_registry');
            $table->string('access_token_hash');
            $table->string('refresh_token_hash')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_long', 11, 8)->nullable();
            $table->string('ip_city')->nullable();
            $table->string('ip_country')->nullable();
            $table->enum('gps_source', ['gps', 'ip_fallback', 'manual'])->nullable();
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->references('id')->on('users');
            $table->string('token_hash');
            $table->uuid('requested_by')->nullable()->references('id')->on('users');
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->references('id')->on('users');
            $table->uuid('acting_on_behalf_of')->nullable()->references('id')->on('users');
            $table->string('action_type');
            $table->string('entity_type');
            $table->uuid('entity_id')->nullable();
            $table->json('before_snapshot')->nullable();
            $table->json('after_snapshot')->nullable();
            $table->json('metadata')->nullable();
            $table->uuid('device_id')->nullable()->references('id')->on('device_registry');
            $table->ipAddress('ip_address')->nullable();
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_long', 11, 8)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
            $table->index('device_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('device_registry');
        Schema::dropIfExists('group_locations');
        Schema::dropIfExists('user_locations');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('user_groups');
        Schema::dropIfExists('group_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('group_inheritance');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('users');
    }
};
