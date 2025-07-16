<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;
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
        
        $this->actingAs($this->user);
    }

    public function test_user_can_get_project_tasks(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/tasks");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Задачи успешно загружены'
            ]);
    }

    public function test_user_can_create_task(): void
    {
        $taskData = [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'priority' => 'high'
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/tasks", $taskData);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'title',
                    'description',
                    'priority',
                    'project_id',
                    'reporter_id',
                    'created_at',
                    'updated_at'
                ],
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Задача успешно создана',
                'data' => [
                    'title' => 'Test Task',
                    'description' => 'Test Description',
                    'priority' => 'high'
                ]
            ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'priority' => 'high',
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id
        ]);
    }

    public function test_user_can_view_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/tasks/{$task->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Задача успешно загружена',
                'data' => [
                    'id' => $task->id,
                    'title' => $task->title
                ]
            ]);
    }

    public function test_user_cannot_view_task_from_other_project(): void
    {
        $otherProject = Project::factory()->create(['owner_id' => $this->otherUser->id]);
        $otherStatus = TaskStatus::factory()->create(['project_id' => $otherProject->id]);
        $task = Task::factory()->create([
            'project_id' => $otherProject->id,
            'reporter_id' => $this->otherUser->id,
            'status_id' => $otherStatus->id
        ]);

        $response = $this->getJson("/api/projects/{$otherProject->id}/tasks/{$task->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_update_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $updateData = [
            'title' => 'Updated Task',
            'description' => 'Updated Description',
            'priority' => 'critical'
        ];

        $response = $this->putJson("/api/projects/{$this->project->id}/tasks/{$task->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Задача успешно обновлена',
                'data' => [
                    'title' => 'Updated Task',
                    'description' => 'Updated Description',
                    'priority' => 'critical'
                ]
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Task',
            'description' => 'Updated Description',
            'priority' => 'critical'
        ]);
    }

    public function test_user_can_update_task_status(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $newStatus = TaskStatus::factory()->create([
            'project_id' => $this->project->id,
            'name' => 'In Progress',
            'order' => 2
        ]);

        $response = $this->putJson("/api/tasks/{$task->id}/status", [
            'status_id' => $newStatus->id
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Статус задачи успешно обновлен'
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status_id' => $newStatus->id
        ]);
    }

    public function test_user_can_assign_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $assignee = User::factory()->create();

        $response = $this->putJson("/api/tasks/{$task->id}/assign", [
            'assignee_id' => $assignee->id
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Исполнитель задачи успешно назначен'
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'assignee_id' => $assignee->id
        ]);
    }

    public function test_user_can_delete_task(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $response = $this->deleteJson("/api/projects/{$this->project->id}/tasks/{$task->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Задача успешно удалена'
            ]);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_user_can_get_project_board(): void
    {
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id,
            'status_id' => $this->status->id
        ]);

        $response = $this->getJson("/api/projects/{$this->project->id}/board");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Доска проекта успешно загружена'
            ]);
    }

    public function test_task_creation_requires_title(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/tasks", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_task_priority_must_be_valid(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/tasks", [
            'title' => 'Test Task',
            'priority' => 'invalid'
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['priority']);
    }
}
