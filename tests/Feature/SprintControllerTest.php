<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\ProjectMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SprintControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Index')
            ->where('project.id', $project->id)
            ->has('sprints')
        );
    }

    public function test_index_page_is_displayed_for_member(): void
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
            ->get("/projects/{$project->id}/sprints");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Index')
            ->where('project.id', $project->id)
        );
    }

    public function test_index_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints");

        $response->assertForbidden();
    }

    public function test_create_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/create");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Form')
            ->where('project.id', $project->id)
            ->where('sprint', null)
        );
    }

    public function test_create_page_is_displayed_for_member(): void
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
            ->get("/projects/{$project->id}/sprints/create");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Form')
            ->where('project.id', $project->id)
        );
    }

    public function test_create_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/create");

        $response->assertForbidden();
    }

    public function test_store_creates_new_sprint(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->post("/projects/{$project->id}/sprints", [
                'name' => 'Test Sprint',
                'description' => 'Test Description',
                'start_date' => now()->addDay()->format('Y-m-d'),
                'end_date' => now()->addDays(14)->format('Y-m-d'),
                'status' => 'planned',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Спринт успешно создан.');

        $this->assertDatabaseHas('sprints', [
            'name' => 'Test Sprint',
            'description' => 'Test Description',
            'project_id' => $project->id,
            'status' => 'planned',
        ]);
    }

    // TODO: исправить логику авторизации для members
    // public function test_store_allows_access_for_member(): void

    public function test_store_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->post("/projects/{$project->id}/sprints", []);

        $response->assertSessionHasErrors(['name', 'start_date', 'end_date']);
    }

    public function test_store_validates_date_constraints(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->post("/projects/{$project->id}/sprints", [
                'name' => 'Test Sprint',
                'description' => 'Test Description',
                'start_date' => now()->subDay()->format('Y-m-d'), // Вчера
                'end_date' => now()->addDay()->format('Y-m-d'),
                'status' => 'planned',
            ]);

        $response->assertSessionHasErrors(['start_date']);
    }

    public function test_store_validates_end_date_after_start_date(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->post("/projects/{$project->id}/sprints", [
                'name' => 'Test Sprint',
                'description' => 'Test Description',
                'start_date' => now()->addDays(14)->format('Y-m-d'),
                'end_date' => now()->addDay()->format('Y-m-d'), // Раньше start_date
                'status' => 'planned',
            ]);

        $response->assertSessionHasErrors(['end_date']);
    }

    public function test_show_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Show')
            ->where('project.id', $project->id)
            ->where('sprint.id', $sprint->id)
        );
    }

    public function test_show_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Show')
            ->where('project.id', $project->id)
            ->where('sprint.id', $sprint->id)
        );
    }

    public function test_show_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}");

        $response->assertForbidden();
    }

    public function test_edit_page_is_displayed_for_owner(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Form')
            ->where('project.id', $project->id)
            ->where('sprint.id', $sprint->id)
        );
    }

    public function test_edit_page_is_displayed_for_member(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        
        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Sprints/Form')
            ->where('project.id', $project->id)
            ->where('sprint.id', $sprint->id)
        );
    }

    public function test_edit_page_denies_access_for_unauthorized_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->get("/projects/{$project->id}/sprints/{$sprint->id}/edit");

        $response->assertForbidden();
    }

    public function test_update_updates_sprint(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->put("/projects/{$project->id}/sprints/{$sprint->id}", [
                'name' => 'Updated Sprint',
                'description' => 'Updated Description',
                'start_date' => now()->addDay()->format('Y-m-d'),
                'end_date' => now()->addDays(21)->format('Y-m-d'),
                'status' => 'active',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Спринт успешно обновлен.');

        $this->assertDatabaseHas('sprints', [
            'id' => $sprint->id,
            'name' => 'Updated Sprint',
            'description' => 'Updated Description',
            'status' => 'active',
        ]);
    }

    // public function test_update_allows_access_for_member(): void

    public function test_destroy_deletes_sprint(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/projects/{$project->id}/sprints/{$sprint->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Спринт успешно удален.');

        $this->assertDatabaseMissing('sprints', ['id' => $sprint->id]);
    }

    // public function test_destroy_allows_access_for_member(): void

    public function test_sprints_require_authentication(): void
    {
        $project = Project::factory()->create();
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        $response = $this->get("/projects/{$project->id}/sprints");
        $response->assertRedirect('/login');

        $response = $this->get("/projects/{$project->id}/sprints/create");
        $response->assertRedirect('/login');
    }
}
