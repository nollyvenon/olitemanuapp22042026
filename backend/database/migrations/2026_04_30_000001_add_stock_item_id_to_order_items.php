<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->uuid('stock_item_id')->nullable()->after('order_id')->references('id')->on('stock_items');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeignKey(['stock_item_id']);
            $table->dropColumn('stock_item_id');
        });
    }
};
