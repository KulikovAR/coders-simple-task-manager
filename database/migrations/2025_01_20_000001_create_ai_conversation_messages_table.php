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
        Schema::create('ai_conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->onDelete('cascade');
            $table->enum('type', ['user', 'ai']);
            $table->text('content');
            $table->boolean('success')->default(true);
            $table->integer('commands_executed')->default(0);
            $table->json('results')->nullable();
            $table->float('processing_time')->nullable(); // время обработки в секундах
            $table->timestamps();
            
            $table->index(['conversation_id', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversation_messages');
    }
}; 