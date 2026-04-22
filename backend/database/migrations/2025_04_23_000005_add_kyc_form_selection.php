<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('kyc_submissions', function (Blueprint $table) {
            $table->enum('form_selection', ['form_attached', 'no_form'])->nullable()->after('status');
        });
    }

    public function down(): void {
        Schema::table('kyc_submissions', function (Blueprint $table) {
            $table->dropColumn('form_selection');
        });
    }
};
