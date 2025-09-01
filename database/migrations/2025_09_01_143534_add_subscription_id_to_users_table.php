<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->onDelete('set null');
            $table->dateTime('subscription_expires_at')->nullable();
            $table->integer('ai_requests_used')->default(0);
            $table->dateTime('ai_requests_reset_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->onDelete('set null');
            $table->dateTime('subscription_expires_at')->nullable();
            $table->integer('ai_requests_used')->default(0);
            $table->dateTime('ai_requests_reset_at')->nullable();
        });
    }
};
