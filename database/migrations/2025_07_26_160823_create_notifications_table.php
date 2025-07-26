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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // task_assigned, task_moved, comment_added, sprint_started, etc.
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // получатель
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('set null'); // отправитель
            $table->morphs('notifiable'); // связанная сущность (task, project, sprint, comment)
            $table->json('data')->nullable(); // дополнительные данные
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'read']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
