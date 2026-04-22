<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('market_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('version_number')->default(1);
            $table->uuid('parent_id')->nullable()->references('id')->on('market_plans');
            $table->boolean('is_current')->default(true);
            $table->enum('type', ['daily', 'weekly', 'monthly']);
            $table->text('remark');
            $table->enum('status', ['NOT_VETTED', 'VETTED'])->default('NOT_VETTED');
            $table->uuid('created_by')->references('id')->on('users');
            $table->uuid('vetted_by')->nullable()->references('id')->on('users');
            $table->timestamp('vetted_at')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void {
        Schema::dropIfExists('market_plans');
    }
};
