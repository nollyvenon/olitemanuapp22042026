<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('manual_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('manuals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->enum('type', ['user', 'admin'])->default('user');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('unhelpful_count')->default(0);
            $table->json('related_articles')->nullable();
            $table->json('keywords')->nullable();
            $table->timestamps();
            $table->foreign('category_id')->references('id')->on('manual_categories')->onDelete('cascade');
        });

        Schema::create('manual_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('manual_id');
            $table->integer('version_number');
            $table->longText('content');
            $table->uuid('created_by');
            $table->text('change_notes')->nullable();
            $table->timestamps();
            $table->foreign('manual_id')->references('id')->on('manuals')->onDelete('cascade');
        });

        Schema::create('manual_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('manual_id');
            $table->uuid('role_id')->nullable();
            $table->uuid('group_id')->nullable();
            $table->enum('visibility', ['public', 'role_based', 'group_based'])->default('public');
            $table->timestamps();
            $table->foreign('manual_id')->references('id')->on('manuals')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->unique(['manual_id', 'role_id', 'group_id']);
        });

        Schema::create('manual_feedback', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('manual_id');
            $table->uuid('user_id');
            $table->enum('rating', ['helpful', 'unhelpful'])->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->foreign('manual_id')->references('id')->on('manuals')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('manual_search_index', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('manual_id');
            $table->fullText('search_text')->nullable();
            $table->timestamps();
            $table->foreign('manual_id')->references('id')->on('manuals')->onDelete('cascade');
            $table->index('manual_id');
        });

        Schema::create('contextual_help', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('page_route')->unique();
            $table->uuid('manual_id');
            $table->string('help_icon_text')->default('Help');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('manual_id')->references('id')->on('manuals')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('contextual_help');
        Schema::dropIfExists('manual_search_index');
        Schema::dropIfExists('manual_feedback');
        Schema::dropIfExists('manual_permissions');
        Schema::dropIfExists('manual_versions');
        Schema::dropIfExists('manuals');
        Schema::dropIfExists('manual_categories');
    }
};
