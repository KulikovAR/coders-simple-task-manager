<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\TaskStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskStatusServiceTest extends TestCase
{
    use RefreshDatabase;

    private TaskStatusService $service;
    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(TaskStatusService::class);
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        
        // Создаём дефолтные статусы проекта
        $this->service->createDefaultProjectStatuses($this->project);
    }

    /** @test */
    public function it_returns_project_statuses_when_no_sprint_context()
    {
        $statuses = $this->service->getContextualStatuses($this->project);
        
        $this->assertCount(6, $statuses); // 6 дефолтных статусов
        $this->assertTrue($statuses->every(fn($status) => $status->project_id === $this->project->id));
        $this->assertTrue($statuses->every(fn($status) => $status->sprint_id === null));
    }

    /** @test */
    public function it_returns_project_statuses_when_sprint_has_no_custom_statuses()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        $statuses = $this->service->getContextualStatuses($this->project, $sprint);
        
        $this->assertCount(6, $statuses);
        $this->assertTrue($statuses->every(fn($status) => $status->project_id === $this->project->id));
        $this->assertTrue($statuses->every(fn($status) => $status->sprint_id === null));
    }

    /** @test */
    public function it_returns_sprint_statuses_when_sprint_has_custom_statuses()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомные статусы для спринта
        $customStatuses = [
            ['name' => 'Backlog', 'order' => 1, 'color' => '#FF0000'],
            ['name' => 'In Progress', 'order' => 2, 'color' => '#00FF00'],
            ['name' => 'Done', 'order' => 3, 'color' => '#0000FF'],
        ];
        
        foreach ($customStatuses as $index => $statusData) {
            TaskStatus::create([
                'project_id' => $this->project->id,
                'sprint_id' => $sprint->id,
                'name' => $statusData['name'],
                'order' => $statusData['order'],
                'color' => $statusData['color'],
                'is_custom' => true,
            ]);
        }
        
        $statuses = $this->service->getContextualStatuses($this->project, $sprint);
        
        $this->assertCount(3, $statuses);
        $this->assertTrue($statuses->every(fn($status) => $status->sprint_id === $sprint->id));
        $this->assertTrue($statuses->every(fn($status) => $status->is_custom === true));
    }

    /** @test */
    public function it_prioritizes_task_context_over_sprint_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        $otherSprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Создаём кастомные статусы для первого спринта
        $customStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Custom Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        // Создаём задачу в первом спринте
        $task = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $customStatus->id,
        ]);
        
        // Вызываем с контекстом второго спринта, но передаём задачу из первого
        $statuses = $this->service->getContextualStatuses($this->project, $otherSprint, $task);
        
        // Должны получить статусы спринта задачи, а не переданного спринта
        $this->assertCount(1, $statuses);
        $this->assertEquals($sprint->id, $statuses->first()->sprint_id);
    }

    /** @test */
    public function it_validates_status_context_correctly()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Статус проекта
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        // Кастомный статус спринта
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        // Статус проекта должен быть валидным для проекта
        $this->assertTrue($this->service->isStatusValidForContext($projectStatus, $this->project));
        
        // Статус проекта должен быть валидным для спринта без кастомных статусов
        $emptySprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        $this->assertTrue($this->service->isStatusValidForContext($projectStatus, $this->project, $emptySprint));
        
        // Статус проекта НЕ должен быть валидным для спринта с кастомными статусами
        $this->assertFalse($this->service->isStatusValidForContext($projectStatus, $this->project, $sprint));
        
        // Кастомный статус спринта должен быть валидным для своего спринта
        $this->assertTrue($this->service->isStatusValidForContext($sprintStatus, $this->project, $sprint));
        
        // Кастомный статус спринта НЕ должен быть валидным для проекта
        $this->assertFalse($this->service->isStatusValidForContext($sprintStatus, $this->project));
    }

    /** @test */
    public function it_checks_custom_statuses_existence_correctly()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        // Изначально нет кастомных статусов
        $this->assertFalse($this->service->hasCustomStatuses($sprint));
        
        // Добавляем кастомный статус
        TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Custom Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        // Теперь есть кастомные статусы
        $this->assertTrue($this->service->hasCustomStatuses($sprint));
    }

    /** @test */
    public function it_returns_correct_available_statuses_for_task()
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
        
        // Задача в спринте должна получить статусы спринта
        $taskInSprint = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $sprintStatus->id,
        ]);
        
        $statusesForSprintTask = $this->service->getAvailableStatusesForTask($taskInSprint, $this->project);
        $this->assertCount(1, $statusesForSprintTask);
        $this->assertEquals($sprint->id, $statusesForSprintTask->first()->sprint_id);
        
        // Задача вне спринта должна получить статусы проекта
        $taskInProject = Task::factory()->create([
            'project_id' => $this->project->id,
            'sprint_id' => null,
            'status_id' => $this->service->getProjectStatuses($this->project)->first()->id,
        ]);
        
        $statusesForProjectTask = $this->service->getAvailableStatusesForTask($taskInProject, $this->project);
        $this->assertCount(6, $statusesForProjectTask);
        $this->assertTrue($statusesForProjectTask->every(fn($status) => $status->sprint_id === null));
    }

    /** @test */
    public function it_generates_correct_status_stats()
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
        
        // Создаём задачи в разных контекстах
        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $sprintStatus->id,
        ]);
        
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        Task::factory()->count(2)->create([
            'project_id' => $this->project->id,
            'sprint_id' => null,
            'status_id' => $projectStatus->id,
        ]);
        
        // Статистика для спринта
        $sprintStats = $this->service->getStatusStats($this->project, $sprint);
        $this->assertCount(1, $sprintStats);
        $this->assertEquals(3, $sprintStats[0]['task_count']);
        
        // Статистика для проекта
        $projectStats = $this->service->getStatusStats($this->project);
        $this->assertCount(6, $projectStats);
        // Найдём статистику для первого статуса
        $firstStatusStats = collect($projectStats)->first(fn($stat) => $stat['status']->id === $projectStatus->id);
        $this->assertEquals(2, $firstStatusStats['task_count']);
    }
}