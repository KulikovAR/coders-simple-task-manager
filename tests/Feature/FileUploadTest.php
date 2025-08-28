<?php

namespace Tests\Feature;

use App\Models\FileAttachment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileUploadTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Task $task;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Создаем тестового пользователя
        $this->user = User::factory()->create();
        
        // Создаем тестовую задачу
        $this->task = Task::factory()->create([
            'reporter_id' => $this->user->id,
        ]);
        
        // Настраиваем тестовое хранилище
        Storage::fake('public');
    }

    /** @test */
    public function user_can_upload_file()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
            'description' => 'Тестовый документ'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Файл успешно загружен'
        ]);

        $this->assertDatabaseHas('file_attachments', [
            'user_id' => $this->user->id,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
            'original_name' => 'document.pdf',
            'description' => 'Тестовый документ'
        ]);

        // Проверяем, что файл сохранен на диске
        $attachment = FileAttachment::where('attachable_type', 'App\\Models\\Task')
            ->where('attachable_id', $this->task->id)
            ->first();
        
        Storage::disk('public')->assertExists($attachment->file_path);
    }

    /** @test */
    public function user_cannot_upload_file_without_attachable_type()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->post('/file-upload', [
            'file' => $file,
            'attachable_id' => $this->task->id,
            'description' => 'Тестовый документ'
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('file_attachments', [
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);
    }

    /** @test */
    public function user_cannot_upload_file_without_attachable_id()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'description' => 'Тестовый документ'
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('file_attachments', [
            'attachable_type' => 'App\\Models\\Task',
        ]);
    }

    /** @test */
    public function user_cannot_upload_file_larger_than_limit()
    {
        $this->actingAs($this->user);

        // Создаем файл размером 51MB (превышает лимит 50MB)
        $file = UploadedFile::fake()->create('large_document.pdf', 51 * 1024 * 1024);

        $response = $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('file_attachments', [
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);
    }

    /** @test */
    public function user_cannot_upload_unsupported_file_type()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('script.exe', 1024);

        $response = $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('file_attachments', [
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);
    }

    /** @test */
    public function user_can_download_uploaded_file()
    {
        $this->actingAs($this->user);

        // Создаем файл и загружаем его
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        
        $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $attachment = FileAttachment::where('attachable_type', 'App\\Models\\Task')
            ->where('attachable_id', $this->task->id)
            ->first();

        $response = $this->get("/file-upload/{$attachment->id}/download");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function user_can_delete_own_file()
    {
        $this->actingAs($this->user);

        // Создаем файл и загружаем его
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        
        $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $attachment = FileAttachment::where('attachable_type', 'App\\Models\\Task')
            ->where('attachable_id', $this->task->id)
            ->first();

        $response = $this->delete("/file-upload/{$attachment->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Файл успешно удален'
        ]);

        $this->assertDatabaseMissing('file_attachments', [
            'id' => $attachment->id,
        ]);

        // Проверяем, что файл удален с диска
        Storage::disk('public')->assertMissing($attachment->file_path);
    }

    /** @test */
    public function user_cannot_delete_other_user_file()
    {
        $otherUser = User::factory()->create();
        $this->actingAs($otherUser);

        // Создаем файл от имени другого пользователя
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        
        $this->actingAs($this->user)->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $attachment = FileAttachment::where('attachable_type', 'App\\Models\\Task')
            ->where('attachable_id', $this->task->id)
            ->first();

        // Пытаемся удалить файл от имени другого пользователя
        $this->actingAs($otherUser);
        $response = $this->delete("/file-upload/{$attachment->id}");

        $response->assertStatus(403);
        
        // Файл должен остаться в базе
        $this->assertDatabaseHas('file_attachments', [
            'id' => $attachment->id,
        ]);
    }

    /** @test */
    public function user_can_get_file_statistics()
    {
        $this->actingAs($this->user);

        // Загружаем несколько файлов
        $files = [
            UploadedFile::fake()->create('doc1.pdf', 1024),
            UploadedFile::fake()->create('doc2.pdf', 2048),
        ];

        foreach ($files as $file) {
            $this->post('/file-upload', [
                'file' => $file,
                'attachable_type' => 'App\\Models\\Task',
                'attachable_id' => $this->task->id,
            ]);
        }

        $response = $this->get('/file-upload/user-stats');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'total_size' => 3072, // 1024 + 2048
            ]
        ]);
    }

    /** @test */
    public function file_attachments_are_deleted_with_task()
    {
        $this->actingAs($this->user);

        // Создаем файл и загружаем его
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        
        $this->post('/file-upload', [
            'file' => $file,
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->task->id,
        ]);

        $attachment = FileAttachment::where('attachable_type', 'App\\Models\\Task')
            ->where('attachable_id', $this->task->id)
            ->first();

        // Удаляем задачу
        $this->task->delete();

        // Проверяем, что файл удален из базы
        $this->assertDatabaseMissing('file_attachments', [
            'id' => $attachment->id,
        ]);

        // Проверяем, что файл удален с диска
        Storage::disk('public')->assertMissing($attachment->file_path);
    }
}
