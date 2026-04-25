<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('manuals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->longText('content');
            $table->string('module')->index();
            $table->string('slug')->unique();
            $table->json('roles_allowed')->nullable();
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('manuals');
    }
};
