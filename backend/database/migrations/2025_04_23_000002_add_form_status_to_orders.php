<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('form_status', ['manual_captured', 'no_manual_form'])->nullable()->after('status');
        });
    }

    public function down(): void {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('form_status');
        });
    }
};
