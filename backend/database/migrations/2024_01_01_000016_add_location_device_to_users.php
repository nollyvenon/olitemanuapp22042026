<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_login_location')->nullable()->after('last_login_ip');
            $table->json('last_device_info')->nullable()->after('last_login_location');
            $table->boolean('is_sub_admin')->default(false)->after('is_active');
            $table->uuid('sub_admin_parent_id')->nullable()->after('is_sub_admin');
            $table->foreign('sub_admin_parent_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['sub_admin_parent_id']);
            $table->dropColumn(['last_login_location', 'last_device_info', 'is_sub_admin', 'sub_admin_parent_id']);
        });
    }
};
