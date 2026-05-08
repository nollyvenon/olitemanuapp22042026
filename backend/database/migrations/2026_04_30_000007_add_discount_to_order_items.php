<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('discount', 15, 2)->nullable()->default(0)->after('unit_price');
            $table->decimal('discount_percent', 5, 2)->nullable()->default(0)->after('discount');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['discount', 'discount_percent']);
        });
    }
};
