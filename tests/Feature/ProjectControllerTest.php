<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\Sprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/projects');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->has('projects')
            ->has('filters')
        );
    }

    public function test_index_shows_user_projects(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/projects');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->where('projects.0.id', $project->id)
        );
    }

    public function test_index_shows_member_projects(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/projects');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->where('projects.0.id', $project->id)
        );
    }

    public function test_index_with_search_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'name' => 'Test Project']);

        $response = $this
            ->actingAs($user)
            ->get('/projects?search=Test');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->where('filters.search', 'Test')
        );
    }

    public function test_index_with_status_filter(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);

        $response = $this
            ->actingAs($user)
            ->get('/projects?status=active');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->where('filters.status', 'active')
        );
    }

    public function test_create_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/projects/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Form')
        );
    }

    public function test_store_creates_new_project(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/projects', [
                'name' => 'Test Project',
                'description' => 'Test Description',
                'status' => 'active',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Проект успешно создан.');

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'description' => 'Test Description',
            'owner_id' => $user->id,
        ]);
    }

    public function test_show_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Show')
            ->where('project.id', $project->id)
        );
    }

    public function test_show_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Show')
            ->where('project.id', $project->id)
        );
    }

    public function test_show_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}");

        $response->assertForbidden();
    }

    public function test_board_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $taskStatus = TaskStatus::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/board");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Board')
            ->where('project.id', $project->id)
            ->has('taskStatuses')
            ->has('sprints')
            ->has('members')
        );
    }

    public function test_board_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $taskStatus = TaskStatus::factory()->create(['project_id' => $project->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/board");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Board')
            ->where('project.id', $project->id)
        );
    }

    public function test_board_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/board");

        $response->assertForbidden();
    }

    public function test_edit_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Form')
            ->where('project.id', $project->id)
        );
    }

    public function test_edit_page_denies_access_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/edit");

        $response->assertForbidden();
    }

    public function test_update_updates_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->put("/projects/{$project->id}", [
                'name' => 'Updated Project',
                'description' => 'Updated Description',
                'status' => 'inactive',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Проект успешно обновлен.');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project',
            'description' => 'Updated Description',
        ]);
    }

    public function test_update_denies_access_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->put("/projects/{$project->id}", [
                'name' => 'Updated Project',
                'description' => 'Updated Description',
            ]);

        $response->assertForbidden();
    }

    public function test_destroy_deletes_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/projects/{$project->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Проект успешно удален.');

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_destroy_denies_access_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/projects/{$project->id}");

        $response->assertForbidden();
    }

    public function test_projects_require_authentication(): void
    {
        $response = $this->get('/projects');
        $response->assertRedirect('/login');

        $response = $this->get('/projects/create');
        $response->assertRedirect('/login');
    }
}
