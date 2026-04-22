<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('username', 100)->unique();
            $table->string('password_hash');
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->text('avatar_url')->nullable();
            $table->string('phone_number', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_email_verified')->default(false);
            $table->timestampTz('last_login_at')->nullable();
            $table->ipAddress('last_login_ip')->nullable();
            $table->timestampTz('deleted_at')->nullable();
            $table->timestampsTz();

            $table->index('email');
            $table->index('username');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
