<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('stock_journals', function (Blueprint $table) {
            $table->date('journal_date')->nullable()->after('notes');
        });
    }

    public function down(): void {
        Schema::table('stock_journals', function (Blueprint $table) {
            $table->dropColumn('journal_date');
        });
    }
};
