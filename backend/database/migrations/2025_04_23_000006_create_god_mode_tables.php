<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('god_mode_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('god_admin_id')->references('id')->on('users');
            $table->string('action_type');
            $table->string('module');
            $table->uuid('affected_entity_id')->nullable();
            $table->string('affected_entity_type')->nullable();
            $table->jsonb('previous_state')->nullable();
            $table->jsonb('new_state')->nullable();
            $table->text('reason');
            $table->uuid('impersonated_user_id')->nullable();
            $table->uuid('device_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['god_admin_id', 'created_at']);
            $table->index(['affected_entity_type', 'affected_entity_id']);
        });

        Schema::create('god_mode_confirmations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('god_admin_id')->references('id')->on('users');
            $table->string('action_type');
            $table->text('reason');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->uuid('confirmed_by')->nullable()->references('id')->on('users');
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('god_mode_confirmations');
        Schema::dropIfExists('god_mode_actions');
    }
};
