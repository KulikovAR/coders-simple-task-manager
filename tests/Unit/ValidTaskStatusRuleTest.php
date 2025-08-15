<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Models\User;
use App\Rules\ValidTaskStatus;
use App\Services\TaskStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidTaskStatusRuleTest extends TestCase
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
    public function it_validates_project_status_for_project_context()
    {
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        $rule = new ValidTaskStatus($this->project);
        $failed = false;
        
        $rule->validate('status_id', $projectStatus->id, function ($message) use (&$failed) {
            $failed = true;
        });
        
        $this->assertFalse($failed, 'Статус проекта должен быть валидным для проекта');
    }

    /** @test */
    public function it_validates_project_status_for_sprint_without_custom_statuses()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        $rule = new ValidTaskStatus($this->project, $sprint);
        $failed = false;
        
        $rule->validate('status_id', $projectStatus->id, function ($message) use (&$failed) {
            $failed = true;
        });
        
        $this->assertFalse($failed, 'Статус проекта должен быть валидным для спринта без кастомных статусов');
    }

    /** @test */
    public function it_rejects_project_status_for_sprint_with_custom_statuses()
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
        
        $projectStatus = $this->service->getProjectStatuses($this->project)->first();
        
        $rule = new ValidTaskStatus($this->project, $sprint);
        $failed = false;
        $failMessage = '';
        
        $rule->validate('status_id', $projectStatus->id, function ($message) use (&$failed, &$failMessage) {
            $failed = true;
            $failMessage = $message;
        });
        
        $this->assertTrue($failed, 'Статус проекта не должен быть валидным для спринта с кастомными статусами');
        $this->assertStringContainsString('не доступен для спринта', $failMessage);
    }

    /** @test */
    public function it_validates_sprint_status_for_sprint_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $rule = new ValidTaskStatus($this->project, $sprint);
        $failed = false;
        
        $rule->validate('status_id', $sprintStatus->id, function ($message) use (&$failed) {
            $failed = true;
        });
        
        $this->assertFalse($failed, 'Статус спринта должен быть валидным для своего спринта');
    }

    /** @test */
    public function it_rejects_sprint_status_for_project_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $rule = new ValidTaskStatus($this->project);
        $failed = false;
        $failMessage = '';
        
        $rule->validate('status_id', $sprintStatus->id, function ($message) use (&$failed, &$failMessage) {
            $failed = true;
            $failMessage = $message;
        });
        
        $this->assertTrue($failed, 'Статус спринта не должен быть валидным для проекта');
        $this->assertStringContainsString('не доступен для проекта', $failMessage);
    }

    /** @test */
    public function it_rejects_non_existent_status()
    {
        $rule = new ValidTaskStatus($this->project);
        $failed = false;
        $failMessage = '';
        
        $rule->validate('status_id', 999999, function ($message) use (&$failed, &$failMessage) {
            $failed = true;
            $failMessage = $message;
        });
        
        $this->assertTrue($failed, 'Несуществующий статус должен быть отклонён');
        $this->assertStringContainsString('не существует', $failMessage);
    }

    /** @test */
    public function it_rejects_status_from_different_project()
    {
        $otherProject = Project::factory()->create(['owner_id' => $this->user->id]);
        $this->service->createDefaultProjectStatuses($otherProject);
        
        $otherProjectStatus = $this->service->getProjectStatuses($otherProject)->first();
        
        $rule = new ValidTaskStatus($this->project);
        $failed = false;
        $failMessage = '';
        
        $rule->validate('status_id', $otherProjectStatus->id, function ($message) use (&$failed, &$failMessage) {
            $failed = true;
            $failMessage = $message;
        });
        
        $this->assertTrue($failed, 'Статус из другого проекта должен быть отклонён');
        $this->assertStringContainsString('не доступен для проекта', $failMessage);
    }

    /** @test */
    public function it_skips_validation_when_no_project_context()
    {
        $rule = new ValidTaskStatus();
        $failed = false;
        
        $rule->validate('status_id', 999999, function ($message) use (&$failed) {
            $failed = true;
        });
        
        $this->assertFalse($failed, 'Валидация должна быть пропущена без контекста проекта');
    }

    /** @test */
    public function it_can_be_configured_fluently()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        $sprintStatus = TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        $rule = (new ValidTaskStatus())
            ->forProject($this->project)
            ->forSprint($sprint);
        
        $failed = false;
        
        $rule->validate('status_id', $sprintStatus->id, function ($message) use (&$failed) {
            $failed = true;
        });
        
        $this->assertFalse($failed, 'Fluent конфигурация должна работать корректно');
    }

    /** @test */
    public function it_returns_available_statuses_for_context()
    {
        $sprint = Sprint::factory()->create(['project_id' => $this->project->id]);
        
        TaskStatus::create([
            'project_id' => $this->project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Sprint Status',
            'order' => 1,
            'color' => '#FF0000',
            'is_custom' => true,
        ]);
        
        // Для проекта
        $projectRule = new ValidTaskStatus($this->project);
        $projectStatuses = $projectRule->getAvailableStatuses();
        
        $this->assertCount(6, $projectStatuses);
        $this->assertTrue(collect($projectStatuses)->every(fn($status) => $status['sprint_id'] === null));
        
        // Для спринта
        $sprintRule = new ValidTaskStatus($this->project, $sprint);
        $sprintStatuses = $sprintRule->getAvailableStatuses();
        
        $this->assertCount(1, $sprintStatuses);
        $this->assertEquals($sprint->id, $sprintStatuses[0]['sprint_id']);
        $this->assertTrue($sprintStatuses[0]['is_custom']);
    }
}