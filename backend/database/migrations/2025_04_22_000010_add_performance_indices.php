<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->index('email');
            $table->index('is_active');
        });

        Schema::table('sessions', function (Blueprint $table) {
            $table->index(['user_id', 'is_active']);
            $table->index('expires_at');
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->index(['location_id', 'item_id']);
        });

        Schema::table('stock_journals', function (Blueprint $table) {
            $table->index(['item_id', 'from_location', 'created_at']);
            $table->index(['item_id', 'to_location', 'created_at']);
            $table->index(['type', 'created_at']);
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->index(['ledger_id', 'status']);
            $table->index(['created_at', 'status']);
        });

        Schema::table('ledger_accounts', function (Blueprint $table) {
            $table->index(['location_id', 'territory_id']);
            $table->index(['type', 'is_active']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['customer_id', 'status']);
            $table->index(['created_at', 'status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['order_id', 'status']);
            $table->index('created_at');
        });

        Schema::table('kyc_submissions', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index('customer_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
            $table->index(['action_type', 'created_at']);
        });

        Schema::table('price_list_versions', function (Blueprint $table) {
            $table->index(['is_current', 'status']);
        });

        Schema::table('price_list_items', function (Blueprint $table) {
            $table->index(['version_id', 'item_id']);
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('sessions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_active']);
            $table->dropIndex(['expires_at']);
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropIndex(['location_id', 'item_id']);
        });

        Schema::table('stock_journals', function (Blueprint $table) {
            $table->dropIndex(['item_id', 'from_location', 'created_at']);
            $table->dropIndex(['item_id', 'to_location', 'created_at']);
            $table->dropIndex(['type', 'created_at']);
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropIndex(['ledger_id', 'status']);
            $table->dropIndex(['created_at', 'status']);
        });

        Schema::table('ledger_accounts', function (Blueprint $table) {
            $table->dropIndex(['location_id', 'territory_id']);
            $table->dropIndex(['type', 'is_active']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['customer_id', 'status']);
            $table->dropIndex(['created_at', 'status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['order_id', 'status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('kyc_submissions', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['customer_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'read_at']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['action_type', 'created_at']);
        });

        Schema::table('price_list_versions', function (Blueprint $table) {
            $table->dropIndex(['is_current', 'status']);
        });

        Schema::table('price_list_items', function (Blueprint $table) {
            $table->dropIndex(['version_id', 'item_id']);
        });
    }
};
