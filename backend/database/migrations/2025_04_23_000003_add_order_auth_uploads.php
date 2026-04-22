<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tally_invoice_path')->nullable()->after('form_status');
            $table->string('delivery_note_path')->nullable()->after('tally_invoice_path');
        });
    }

    public function down(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tally_invoice_path', 'delivery_note_path']);
        });
    }
};
