<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('invoice_id')->nullable()->after('id')->references('id')->on('invoices')->cascadeOnDelete();
        });
    }

    public function down(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeignIdFor('Invoice', 'invoice_id');
            $table->dropColumn('invoice_id');
        });
    }
};
