<?php

namespace Tests\Feature\Api;

use App\Enums\CommentType;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;
    private Task $task;
    private TaskStatus $status;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        $this->status = TaskStatus::factory()->create([
            'project_id' => $this->project->id,
            'name' => 'To Do',
            'order' => 1
        ]);
        $this->task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);
        
        $this->actingAs($this->user);
    }

    public function test_user_can_get_task_comments(): void
    {
        $comment = TaskComment::factory()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Комментарии успешно загружены'
            ]);
    }

    public function test_user_can_create_comment(): void
    {
        $commentData = [
            'content' => 'Test comment content',
            'type' => CommentType::GENERAL->value
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments", $commentData);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'content',
                    'type',
                    'user_id',
                    'task_id',
                    'created_at',
                    'updated_at',
                    'user'
                ],
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Комментарий успешно создан',
                'data' => [
                    'content' => 'Test comment content',
                    'type' => CommentType::GENERAL->value
                ]
            ]);

        $this->assertDatabaseHas('task_comments', [
            'content' => 'Test comment content',
            'type' => CommentType::GENERAL->value,
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);
    }

    public function test_user_can_create_testing_feedback_comment(): void
    {
        $commentData = [
            'content' => 'Testing feedback comment',
            'type' => CommentType::TESTING_FEEDBACK->value
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments", $commentData);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'data' => [
                    'type' => CommentType::TESTING_FEEDBACK->value
                ]
            ]);
    }

    public function test_user_can_view_comment(): void
    {
        $comment = TaskComment::factory()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments/{$comment->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Комментарий успешно загружен',
                'data' => [
                    'id' => $comment->id,
                    'content' => $comment->content
                ]
            ]);
    }

    public function test_user_cannot_view_comment_from_other_project(): void
    {
        $otherProject = Project::factory()->create(['owner_id' => $this->otherUser->id]);
        $otherTask = Task::factory()->create(['project_id' => $otherProject->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $otherTask->id,
            'user_id' => $this->otherUser->id
        ]);

        $response = $this->getJson("/api/projects/{$otherProject->id}/tasks/{$otherTask->id}/comments/{$comment->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_update_own_comment(): void
    {
        $comment = TaskComment::factory()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        $updateData = [
            'content' => 'Updated comment content',
            'type' => CommentType::REVIEW_COMMENT->value
        ];

        $response = $this->putJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments/{$comment->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Комментарий успешно обновлен',
                'data' => [
                    'content' => 'Updated comment content',
                    'type' => CommentType::REVIEW_COMMENT->value
                ]
            ]);

        $this->assertDatabaseHas('task_comments', [
            'id' => $comment->id,
            'content' => 'Updated comment content',
            'type' => CommentType::REVIEW_COMMENT->value
        ]);
    }

    public function test_user_cannot_update_other_user_comment(): void
    {
        $comment = TaskComment::factory()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->otherUser->id
        ]);

        $updateData = [
            'content' => 'Updated comment content'
        ];

        $response = $this->putJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments/{$comment->id}", $updateData);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_delete_own_comment(): void
    {
        $comment = TaskComment::factory()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->deleteJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments/{$comment->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Комментарий успешно удален'
            ]);

        $this->assertDatabaseMissing('task_comments', ['id' => $comment->id]);
    }

    public function test_user_can_get_special_comments(): void
    {
        // Создаем обычный комментарий
        TaskComment::factory()->general()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        // Создаем специальный комментарий тестирования
        $specialComment = TaskComment::factory()->testingFeedback()->create([
            'task_id' => $this->task->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments/special");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Специальные комментарии успешно загружены'
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'content',
                        'type',
                        'user_id',
                        'task_id',
                        'created_at',
                        'updated_at',
                        'user'
                    ]
                ],
                'message',
                'timestamp'
            ]);

        // Проверяем, что возвращается только специальный комментарий
        $responseData = $response->json('data');
        $this->assertCount(1, $responseData);
        $this->assertEquals($specialComment->id, $responseData[0]['id']);
        $this->assertEquals(CommentType::TESTING_FEEDBACK->value, $responseData[0]['type']);
    }

    public function test_comment_creation_requires_content(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['content']);
    }

    public function test_comment_type_must_be_valid(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments", [
            'content' => 'Test comment',
            'type' => 'invalid_type'
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_comment_content_has_max_length(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/tasks/{$this->task->id}/comments", [
            'content' => str_repeat('a', 2001)
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['content']);
    }
} 