<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        foreach (['orders', 'kyc_submissions', 'vouchers', 'sales_invoices', 'market_trends'] as $table) {
            if (!Schema::hasTable($table)) continue;
            Schema::table($table, function (Blueprint $table) {
                $table->integer('version_number')->default(1)->after('id');
                $table->uuid('parent_id')->nullable()->after('version_number')->references('id')->on($table);
                $table->boolean('is_current')->default(true)->after('parent_id');
            });
        }
    }

    public function down(): void {
        foreach (['orders', 'kyc_submissions', 'vouchers', 'sales_invoices', 'market_trends'] as $table) {
            if (!Schema::hasTable($table)) continue;
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn(['version_number', 'parent_id', 'is_current']);
            });
        }
    }
};
