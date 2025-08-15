<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\TaskStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskStatusIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;
    private TaskStatusService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        $this->service = app(TaskStatusService::class);
        
        // Создаём дефолтные статусы проекта
        $this->service->createDefaultProjectStatuses($this->project);
    }

    /** @test */
    public function it_returns_project_statuses_when_no_sprint_specified()
    {
        $response = $this->actingAs($this->user)
            ->getJson(route('tasks.project.statuses', $this->project));

        $response->assertOk();
        $data = $response->json();
        
        $this->assertCount(6, $data); // 6 дефолтных статусов
        $this->assertTrue(collect($data)->every(fn($status) => $status['project_id'] === $this->project->id));
        $this->assertTrue(collect($data)->every(fn($status) => $status['sprint_id'] === null));
    }

    /** @test */
    public function it_returns_project_statuses_for_sprint_without_custom_statuses()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->user)
            ->getJson(route('tasks.project.statuses', $this->project) . "?sprint_id={$sprint->id}");

        $response->assertOk();
        $data = $response->json();
        
        $this->assertCount(6, $data);
        $this->assertTrue(collect($data)->every(fn($status) => $status['sprint_id'] === null));
    }

    /** @test */
    public function it_returns_sprint_statuses_when_sprint_has_custom_statuses()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомные статусы для спринта
        TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Custom Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('tasks.project.statuses', $this->project) . "?sprint_id={$sprint->id}");

        $response->assertOk();
        $data = $response->json();
        
        $this->assertCount(1, $data);
        $this->assertEquals($sprint->id, $data[0]['sprint_id']);
        $this->assertTrue($data[0]['is_custom']);
    }

    /** @test */
    public function it_validates_status_context_when_creating_task()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомный статус для спринта
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();

        // Попытка создать задачу в спринте со статусом проекта - должна провалиться
        $response = $this->actingAs($this->user)
            ->postJson(route('tasks.store'), [
                'title' => 'Test Task',
                'project_id' => $this->project->id,
                'sprint_id' => $sprint->id,
                'status_id' => $projectStatus->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status_id']);

        // Создание задачи в спринте с правильным статусом - должно пройти
        $response = $this->actingAs($this->user)
            ->postJson(route('tasks.store'), [
                'title' => 'Test Task',
                'project_id' => $this->project->id,
                'sprint_id' => $sprint->id,
                'status_id' => $sprintStatus->id,
            ]);

        $response->assertStatus(302); // Редирект после успешного создания
    }

    /** @test */
    public function it_validates_status_context_when_updating_task()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомный статус для спринта
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        // Создаём задачу в спринте
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $sprintStatus->id,
        ]);

        // Попытка обновить задачу неправильным статусом
        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.update', $task), [
                'title' => $task->title,
                'project_id' => $this->project->id,
                'sprint_id' => $sprint->id,
                'status_id' => $projectStatus->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status_id']);
    }

    /** @test */
    public function it_updates_task_status_via_board_correctly()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём два кастомных статуса для спринта
        $status1 = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Status 1',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $status2 = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Status 2',
            'order' => 2,
            'color' => '#00FF00',
            'is_custom' => true,
        ]);
        
        // Создаём задачу в первом статусе
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $status1->id,
        ]);

        // Обновляем статус через API доски
        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.status.update', $task), [
                'status_id' => $status2->id,
            ]);

        $response->assertOk();
        
        $task->refresh();
        $this->assertEquals($status2->id, $task->status_id);
    }

    /** @test */
    public function it_prevents_status_update_with_invalid_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомный статус для спринта
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        // Создаём задачу в спринте
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $sprintStatus->id,
        ]);

        // Попытка изменить статус на неправильный через API доски
        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.status.update', $task), [
                'status_id' => $projectStatus->id,
            ]);

        $response->assertStatus(422);
        
        $task->refresh();
        $this->assertEquals($sprintStatus->id, $task->status_id); // Статус не изменился
    }

    /** @test */
    public function it_returns_contextual_statuses_via_new_api_endpoint()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомный статус для спринта
        TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);

        // Запрос без контекста спринта
        $response = $this->actingAs($this->user)
            ->getJson(route('projects.contextual-statuses', $this->project));

        $response->assertOk();
        $data = $response->json();
        
        $this->assertArrayHasKey('statuses', $data);
        $this->assertArrayHasKey('context', $data);
        $this->assertCount(6, $data['statuses']); // Статусы проекта
        $this->assertNull($data['context']['sprint_id']);
        
        // Запрос с контекстом спринта
        $response = $this->actingAs($this->user)
            ->getJson(route('projects.contextual-statuses', $this->project) . "?sprint_id={$sprint->id}");

        $response->assertOk();
        $data = $response->json();
        
        $this->assertCount(1, $data['statuses']); // Кастомные статусы спринта
        $this->assertEquals($sprint->id, $data['context']['sprint_id']);
        $this->assertTrue($data['context']['has_custom_statuses']);
    }

    /** @test */
    public function it_handles_non_existent_sprint_gracefully()
    {
        $response = $this->actingAs($this->user)
            ->getJson(route('tasks.project.statuses', $this->project) . "?sprint_id=999");

        $response->assertStatus(404);
        $response->assertJson(['error' => 'Спринт не найден']);
    }

    /** @test */
    public function board_displays_correct_statuses_for_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомный статус для спринта
        TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);

        // Доска без спринта - должна показать статусы проекта
        $response = $this->actingAs($this->user)
            ->get(route('projects.board', $this->project));

        $response->assertOk();
        $response->assertInertia(fn($page) => 
            $page->has('taskStatuses', 6) // 6 статусов проекта
        );

        // Доска со спринтом - должна показать статусы спринта
        $response = $this->actingAs($this->user)
            ->get(route('projects.board', $this->project) . "?sprint_id={$sprint->id}");

        $response->assertOk();
        $response->assertInertia(fn($page) => 
            $page->has('taskStatuses', 1) // 1 кастомный статус спринта
        );
    }
}