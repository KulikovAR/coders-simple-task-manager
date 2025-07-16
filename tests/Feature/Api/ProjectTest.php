<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        
        $this->actingAs($this->user);
    }

    public function test_user_can_get_their_projects(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->user->id]);

        $response = $this->getJson('/api/projects');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Проекты успешно загружены'
            ]);
    }

    public function test_user_can_create_project(): void
    {
        $projectData = [
            'name' => 'Test Project',
            'description' => 'Test Description'
        ];

        $response = $this->postJson('/api/projects', $projectData);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'owner_id',
                    'created_at',
                    'updated_at'
                ],
                'message',
                'timestamp'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Проект успешно создан',
                'data' => [
                    'name' => 'Test Project',
                    'description' => 'Test Description'
                ]
            ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'description' => 'Test Description',
            'owner_id' => $this->user->id
        ]);

        // Проверяем, что создались стандартные статусы
        $this->assertDatabaseHas('task_statuses', [
            'name' => 'To Do',
            'order' => 1
        ]);
    }

    public function test_user_can_view_their_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->user->id]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Проект успешно загружен',
                'data' => [
                    'id' => $project->id,
                    'name' => $project->name
                ]
            ]);
    }

    public function test_user_cannot_view_other_users_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->otherUser->id]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_update_their_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->user->id]);
        
        $updateData = [
            'name' => 'Updated Project',
            'description' => 'Updated Description'
        ];

        $response = $this->putJson("/api/projects/{$project->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Проект успешно обновлен',
                'data' => [
                    'name' => 'Updated Project',
                    'description' => 'Updated Description'
                ]
            ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project',
            'description' => 'Updated Description'
        ]);
    }

    public function test_user_cannot_update_other_users_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->otherUser->id]);
        
        $updateData = [
            'name' => 'Updated Project'
        ];

        $response = $this->putJson("/api/projects/{$project->id}", $updateData);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_user_can_delete_their_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->user->id]);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Проект успешно удален'
            ]);

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_user_cannot_delete_other_users_project(): void
    {
        $project = Project::factory()->create(['owner_id' => $this->otherUser->id]);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Доступ запрещен'
            ]);
    }

    public function test_project_creation_requires_name(): void
    {
        $response = $this->postJson('/api/projects', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_project_name_has_max_length(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => str_repeat('a', 256)
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }
}
