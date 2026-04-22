<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('market_trends', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category');
            $table->string('metric');
            $table->decimal('value', 18, 2);
            $table->decimal('previous_value', 18, 2)->nullable();
            $table->decimal('change_percent', 5, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['category', 'metric']);
        });

        Schema::create('competitor_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('competitor_name');
            $table->json('products')->nullable();
            $table->json('pricing')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('customer_insights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id');
            $table->decimal('lifetime_value', 18, 2)->default(0);
            $table->decimal('avg_purchase_value', 18, 2)->default(0);
            $table->integer('purchase_frequency')->default(0);
            $table->date('last_purchase_at')->nullable();
            $table->string('segment')->nullable();
            $table->json('behavior')->nullable();
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('customer_insights');
        Schema::dropIfExists('competitor_analysis');
        Schema::dropIfExists('market_trends');
    }
};
