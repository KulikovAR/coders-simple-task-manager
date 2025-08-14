<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\Sprint;
use App\Models\ProjectMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->has('tasks')
            ->has('projects')
            ->has('users')
            ->has('taskStatuses')
            ->has('filters')
        );
    }

    public function test_index_shows_user_tasks(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->has('tasks')
        );
    }

    public function test_index_with_search_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks?search=test');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->where('filters.search', 'test')
        );
    }

    public function test_index_with_status_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks?status=1');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->where('filters.status', '1')
        );
    }

    public function test_index_with_project_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks?project_id={$project->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->where('filters.project_id', (string) $project->id)
        );
    }

    public function test_index_with_my_tasks_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks?my_tasks=1');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->where('filters.my_tasks', '1')
        );
    }

    public function test_create_page_is_displayed(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/tasks/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Form')
            ->has('projects')
            ->has('selectedProjectId')
            ->has('selectedSprintId')
            ->has('sprints')
            ->has('members')
            ->has('taskStatuses')
        );
    }

    public function test_create_page_with_project_id_parameter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        $taskStatus = TaskStatus::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/create?project_id={$project->id}&sprint_id={$sprint->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Form')
            ->where('selectedProjectId', $project->id)
            ->where('selectedSprintId', $sprint->id)
            ->has('sprints')
            ->has('members')
            ->has('taskStatuses')
        );
    }

    public function test_store_creates_new_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $status = TaskStatus::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post('/tasks', [
                'title' => 'Test Task',
                'description' => 'Test Description',
                'project_id' => $project->id,
                'status_id' => $status->id,
                'priority' => 'medium',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Задача успешно создана.');

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'project_id' => $project->id,
            'status_id' => $status->id,
            'priority' => 'medium',
        ]);
    }

    public function test_store_denies_access_for_unauthorized_project(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $status = TaskStatus::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post('/tasks', [
                'title' => 'Test Task',
                'description' => 'Test Description',
                'project_id' => $project->id,
                'status_id' => $status->id,
            ]);

        $response->assertForbidden();
    }

    public function test_show_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Show')
            ->where('task.id', $task->id)
        );
    }

    public function test_show_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Show')
            ->where('task.id', $task->id)
        );
    }

    public function test_show_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}");

        $response->assertForbidden();
    }

    public function test_edit_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Form')
            ->where('task.id', $task->id)
            ->has('projects')
            ->has('sprints')
            ->has('members')
            ->has('taskStatuses')
        );
    }

    public function test_edit_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Tasks/Form')
            ->where('task.id', $task->id)
        );
    }

    public function test_edit_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/tasks/{$task->id}/edit");

        $response->assertForbidden();
    }

    public function test_update_updates_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $status = TaskStatus::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->put("/tasks/{$task->id}", [
                'title' => 'Updated Task',
                'description' => 'Updated Description',
                'status_id' => $status->id,
                'priority' => 'high',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Задача успешно обновлена.');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Task',
            'description' => 'Updated Description',
            'status_id' => $status->id,
            'priority' => 'high',
        ]);
    }

    public function test_update_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->put("/tasks/{$task->id}", [
                'title' => 'Updated Task',
                'description' => 'Updated Description',
            ]);

        $response->assertForbidden();
    }

    public function test_destroy_deletes_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/tasks/{$task->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Задача успешно удалена.');

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_destroy_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/tasks/{$task->id}");

        $response->assertForbidden();
    }

    public function test_tasks_require_authentication(): void
    {
        $response = $this->get('/tasks');
        $response->assertRedirect('/login');

        $response = $this->get('/tasks/create');
        $response->assertRedirect('/login');
    }
}
