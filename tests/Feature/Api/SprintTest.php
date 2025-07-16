<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SprintTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        
        $this->actingAs($this->user);
    }

    public function test_user_can_get_project_sprints(): void
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);

        $response = $this->getJson("/api/projects/{$this->project->id}/sprints");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Спринты успешно загружены'
            ]);
    }

    public function test_user_can_create_sprint(): void
    {
        $sprintData = [
            'name' => 'Test Sprint',
            'description' => 'Test Description',
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(14)->format('Y-m-d'),
            'status' => 'planned'
        ];

        $response = $this->postJson("/api/projects/{$this->project->id}/sprints", $sprintData);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'start_date',
                    'end_date',
                    'status',
                    'project_id',
                    'created_at',
                    'updated_at'
                ],
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Спринт успешно создан',
                'data' => [
                    'name' => 'Test Sprint',
                    'description' => 'Test Description',
                    'status' => 'planned'
                ]
            ]);

        $this->assertDatabaseHas('sprints', [
            'name' => 'Test Sprint',
            'description' => 'Test Description',
            'status' => 'planned',
            'project_id' => $this->project->id
        ]);
    }

    public function test_user_can_view_sprint(): void
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);

        $response = $this->getJson("/api/projects/{$this->project->id}/sprints/{$sprint->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Спринт успешно загружен',
                'data' => [
                    'id' => $sprint->id,
                    'name' => $sprint->name
                ]
            ]);
    }

    public function test_user_cannot_view_sprint_from_other_project(): void
    {
        $otherProject = Project::factory()->create(['owner_id' => $this->otherUser->id]);
        $sprint = Sprint::factory()->create(['project_id' => $otherProject->id]);

        $response = $this->getJson("/api/projects/{$otherProject->id}/sprints/{$sprint->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_update_sprint(): void
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);

        $updateData = [
            'name' => 'Updated Sprint',
            'description' => 'Updated Description',
            'status' => 'active'
        ];

        $response = $this->putJson("/api/projects/{$this->project->id}/sprints/{$sprint->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Спринт успешно обновлен',
                'data' => [
                    'name' => 'Updated Sprint',
                    'description' => 'Updated Description',
                    'status' => 'active'
                ]
            ]);

        $this->assertDatabaseHas('sprints', [
            'id' => $sprint->id,
            'name' => 'Updated Sprint',
            'description' => 'Updated Description',
            'status' => 'active'
        ]);
    }

    public function test_user_can_delete_sprint(): void
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);

        $response = $this->deleteJson("/api/projects/{$this->project->id}/sprints/{$sprint->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Спринт успешно удален'
            ]);

        $this->assertDatabaseMissing('sprints', ['id' => $sprint->id]);
    }

    public function test_sprint_creation_requires_name(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/sprints", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_sprint_creation_requires_dates(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/sprints", [
            'name' => 'Test Sprint'
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    }

    public function test_sprint_end_date_must_be_after_start_date(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/sprints", [
            'name' => 'Test Sprint',
            'start_date' => now()->addDays(14)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d')
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_sprint_status_must_be_valid(): void
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/sprints", [
            'name' => 'Test Sprint',
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(14)->format('Y-m-d'),
            'status' => 'invalid'
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }
}
