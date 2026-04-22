<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->uuid('parent_id')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestampTz('deleted_at')->nullable();
            $table->timestampsTz();

            $table->index('slug');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
