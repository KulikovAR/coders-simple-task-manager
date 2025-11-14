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
        Schema::dropIfExists('seo_recognition_tasks');

        Schema::create('seo_recognition_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('site_id');
            $table->string('status')->default('pending');
            $table->json('search_engines')->nullable();
            $table->integer('total_keywords')->default(0);
            $table->integer('processed_keywords')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['user_id', 'status']);
            $table->index(['site_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Дропаем таблицу
        Schema::dropIfExists('seo_recognition_tasks');

        // Восстанавливаем старую структуру (только id и timestamps)
        Schema::create('seo_recognition_tasks', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
