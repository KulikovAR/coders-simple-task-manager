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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->integer('max_projects')->default(10);
            $table->integer('max_members_per_project')->default(5);
            $table->integer('storage_limit_gb')->default(5);
            $table->integer('ai_requests_limit')->default(5);
            $table->enum('ai_requests_period', ['daily', 'monthly'])->default('monthly');
            $table->boolean('is_custom')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
