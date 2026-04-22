<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('token_hash')->unique();
            $table->uuid('family');
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('device_fingerprint')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'expires_at']);
            $table->index('family');
        });

        Schema::create('login_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('device_fingerprint');
            $table->string('device_os');
            $table->string('device_browser');
            $table->string('ip_address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('logged_in_at');
            $table->timestamp('last_activity_at');
            $table->timestamp('logged_out_at')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'logged_in_at']);
            $table->index('device_fingerprint');
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('token_hash')->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('expires_at');
        });

        Schema::create('user_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('location_id');
            $table->uuid('assigned_by');
            $table->boolean('is_primary')->default(false);
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'location_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_locations');
        Schema::dropIfExists('password_resets');
        Schema::dropIfExists('login_sessions');
        Schema::dropIfExists('refresh_tokens');
    }
};
