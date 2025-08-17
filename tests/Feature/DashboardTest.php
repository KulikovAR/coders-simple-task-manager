<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\ProjectMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('projects')
            ->has('telegram')
        );
    }

    public function test_dashboard_shows_user_projects(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.projects_count', 1)
            ->where('projects.0.id', $project->id)
        );
    }

    public function test_dashboard_shows_member_projects(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id, 'status' => 'active']);

        ProjectMember::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.projects_count', 1)
            ->where('projects.0.id', $project->id)
        );
    }

    public function test_dashboard_shows_tasks_in_progress_count(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        $status = TaskStatus::factory()->create(['name' => 'В работе']);

        Task::factory()->create([
            'project_id' => $project->id,
            'status_id' => $status->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.tasks_in_progress', 1)
        );
    }

    public function test_dashboard_shows_sprints_count(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        Sprint::factory()->create(['project_id' => $project->id]);
        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.sprints_count', 1)
        );
    }

    public function test_dashboard_limits_projects_to_six(): void
    {
        $user = User::factory()->create();

        // Создаем 7 проектов
        for ($i = 0; $i < 7; $i++) {
            Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        }

        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('projects', 6)
        );
    }

    public function test_dashboard_only_shows_active_projects(): void
    {
        $user = User::factory()->create();
        $activeProject = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        $inactiveProject = Project::factory()->create(['owner_id' => $user->id, 'status' => 'on_hold']);

        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('projects.0.id', $activeProject->id)
            ->has('projects', 1)
            ->where('projects', fn ($projects) =>
                collect($projects)->every(fn ($project) => $project['status'] === 'active')
            )
        );
    }

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_dashboard_includes_telegram_info(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id, 'status' => 'active']);
        TaskStatus::factory()->create(['name' => 'In Progress']);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('telegram.bot_username')
            ->has('telegram.bot_link')
        );
    }
}
