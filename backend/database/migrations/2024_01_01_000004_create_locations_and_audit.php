<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by');
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->index('is_active');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('user_email')->nullable();
            $table->uuid('device_id')->nullable();
            $table->string('action_type');
            $table->string('entity');
            $table->uuid('entity_id');
            $table->json('before_snapshot')->nullable();
            $table->json('after_snapshot')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('override_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
            $table->index(['entity', 'entity_id']);
            $table->index(['action_type', 'created_at']);
            $table->index('device_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('locations');
    }
};
