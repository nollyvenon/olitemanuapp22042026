<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', ['opening', 'inwards', 'outwards', 'closing']);
            $table->uuid('location_id');
            $table->uuid('item_id')->nullable();
            $table->uuid('category_id')->nullable();
            $table->date('report_date');
            $table->decimal('quantity', 18, 2);
            $table->decimal('unit_price', 18, 2)->nullable();
            $table->decimal('total_value', 18, 2)->nullable();
            $table->json('filters')->nullable();
            $table->timestamps();
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('stock_items')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('stock_categories')->onDelete('set null');
            $table->index(['report_date', 'location_id', 'type']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('inventory_reports');
    }
};
