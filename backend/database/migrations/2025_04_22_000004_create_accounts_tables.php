<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('territories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });

        Schema::create('price_list_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('version')->unique();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->boolean('is_current')->default(false);
            $table->uuid('uploaded_by')->references('id')->on('users');
            $table->uuid('approved_by')->nullable()->references('id')->on('users');
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('effective_to')->nullable();
            $table->timestamps();
        });

        Schema::create('price_list_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('version_id')->references('id')->on('price_list_versions')->cascadeOnDelete();
            $table->uuid('item_id')->references('id')->on('stock_items');
            $table->decimal('price', 15, 2);
            $table->decimal('min_qty', 15, 2)->default(1);
            $table->string('currency', 3)->default('NGN');
            $table->unique(['version_id', 'item_id']);
        });

        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('account_number')->unique();
            $table->string('name');
            $table->enum('type', ['debtor', 'creditor'])->default('debtor');
            $table->uuid('customer_id')->nullable()->references('id')->on('customers');
            $table->uuid('location_id')->references('id')->on('locations');
            $table->uuid('territory_id')->nullable()->references('id')->on('territories');
            $table->uuid('price_list_version_id')->nullable()->references('id')->on('price_list_versions');
            $table->uuid('sales_officer_id')->nullable()->references('id')->on('users');
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });

        Schema::create('vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('voucher_number')->unique();
            $table->uuid('ledger_id')->references('id')->on('ledger_accounts');
            $table->uuid('created_by')->references('id')->on('users');
            $table->uuid('override_by')->nullable()->references('id')->on('users');
            $table->text('override_reason')->nullable();
            $table->enum('type', ['receipt', 'credit_note', 'debit_note', 'discount', 'sales_reverse'])->default('receipt');
            $table->enum('status', ['pending', 'posted', 'reversed', 'cancelled'])->default('pending');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->date('transaction_date');
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->uuid('reversal_of')->nullable()->references('id')->on('vouchers');
            $table->timestamps();
            $table->index('transaction_date');
            $table->index(['ledger_id', 'type', 'status']);
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('voucher_id')->references('id')->on('vouchers')->cascadeOnDelete();
            $table->uuid('ledger_id')->references('id')->on('ledger_accounts');
            $table->enum('side', ['debit', 'credit']);
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['ledger_id', 'created_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('ledger_accounts');
        Schema::dropIfExists('price_list_items');
        Schema::dropIfExists('price_list_versions');
        Schema::dropIfExists('territories');
    }
};
