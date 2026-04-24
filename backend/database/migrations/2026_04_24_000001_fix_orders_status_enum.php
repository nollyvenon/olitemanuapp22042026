<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // For PostgreSQL: change the enum type carefully
        // The check constraint needs to be dropped first before we can modify

        // Step 1: Find and drop any check constraints on the status column
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");

        // Step 2: Convert column to TEXT (removes enum constraint)
        DB::statement("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE TEXT");

        // Step 3: Update all existing lowercase values to uppercase
        DB::statement("UPDATE orders SET status = 'DRAFT' WHERE status = 'draft'");
        DB::statement("UPDATE orders SET status = 'SUBMITTED' WHERE status = 'confirmed'");
        DB::statement("UPDATE orders SET status = 'SUBMITTED' WHERE status = 'in_progress'");
        DB::statement("UPDATE orders SET status = 'AUTHORIZED' WHERE status = 'completed'");
        DB::statement("UPDATE orders SET status = 'REJECTED' WHERE status = 'cancelled'");

        // Step 4: Drop old enum type and create new one
        DB::statement("DROP TYPE IF EXISTS enum_orders_status CASCADE");
        DB::statement("CREATE TYPE enum_orders_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_AUTH', 'AUTHORIZED', 'OVERRIDDEN')");

        // Step 5: Cast TEXT back to the new ENUM
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE enum_orders_status USING status::enum_orders_status");

        // Step 6: Set default
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'DRAFT'");

        // Step 7: Add override-related columns if they don't exist
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'override_reason')) {
                $table->text('override_reason')->nullable();
            }
            if (!Schema::hasColumn('orders', 'override_by')) {
                $table->uuid('override_by')->nullable()->references('id')->on('users');
            }
            if (!Schema::hasColumn('orders', 'metadata')) {
                $table->json('metadata')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Revert to old enum
        DB::statement("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE TEXT");
        DB::statement("DROP TYPE IF EXISTS enum_orders_status CASCADE");
        DB::statement("CREATE TYPE enum_orders_status AS ENUM ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')");
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE enum_orders_status USING status::enum_orders_status");
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'draft'");

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'override_reason')) {
                $table->dropColumn('override_reason');
            }
            if (Schema::hasColumn('orders', 'override_by')) {
                $table->dropColumn('override_by');
            }
            if (Schema::hasColumn('orders', 'metadata')) {
                $table->dropColumn('metadata');
            }
        });
    }
};
