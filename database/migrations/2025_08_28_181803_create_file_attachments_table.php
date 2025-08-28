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
        Schema::create('file_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_name'); // Оригинальное имя файла
            $table->string('file_name'); // Уникальное имя файла на сервере
            $table->string('file_path'); // Путь к файлу на диске
            $table->string('mime_type'); // MIME тип файла
            $table->bigInteger('file_size'); // Размер файла в байтах
            $table->text('description')->nullable(); // Описание файла
            $table->string('attachable_type'); // Тип объекта, к которому прикреплен файл
            $table->unsignedBigInteger('attachable_id'); // ID объекта
            $table->timestamps();

            // Индексы для оптимизации запросов
            $table->index(['attachable_type', 'attachable_id']);
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_attachments');
    }
};
