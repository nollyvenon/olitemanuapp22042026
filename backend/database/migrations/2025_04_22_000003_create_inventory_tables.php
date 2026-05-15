<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('stock_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });

        Schema::create('stock_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->references('id')->on('stock_categories')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
            $table->unique(['category_id', 'name']);
        });

        Schema::create('stock_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('group_id')->references('id')->on('stock_groups')->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('reorder_level', 15, 2)->default(0);
            $table->string('unit')->default('pieces');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });

        Schema::create('stock_ledgers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('item_id')->references('id')->on('stock_items');
            $table->uuid('location_id')->references('id')->on('locations');
            $table->decimal('quantity', 15, 2)->default(0);
            $table->timestamp('last_counted_at')->nullable();
            $table->uuid('last_counted_by')->nullable()->references('id')->on('users');
            $table->timestamps();
            $table->unique(['item_id', 'location_id']);
            $table->index('quantity');
        });

        Schema::create('stock_journals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('item_id')->references('id')->on('stock_items');
            $table->uuid('from_location')->nullable()->references('id')->on('locations');
            $table->uuid('to_location')->nullable()->references('id')->on('locations');
            $table->decimal('quantity', 15, 2);
            $table->enum('type', ['add', 'transfer', 'remove', 'adjustment', 'sales', 'return'])->default('add');
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->date('journal_date')->nullable();
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['item_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        Schema::create('stock_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('item_id')->references('id')->on('stock_items');
            $table->uuid('location_id')->references('id')->on('locations');
            $table->enum('alert_type', ['low_stock', 'overstock', 'expiring'])->default('low_stock');
            $table->boolean('is_resolved')->default(false);
            $table->uuid('resolved_by')->nullable()->references('id')->on('users');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->unique(['item_id', 'location_id', 'alert_type']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('stock_alerts');
        Schema::dropIfExists('stock_journals');
        Schema::dropIfExists('stock_ledgers');
        Schema::dropIfExists('stock_items');
        Schema::dropIfExists('stock_groups');
        Schema::dropIfExists('stock_categories');
    }
};
