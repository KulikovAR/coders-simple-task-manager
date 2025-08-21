<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskContextualFilterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function it_returns_project_statuses_when_project_selected_but_no_sprint()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        // Создаем статусы проекта
        $projectStatus = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => null,
            'name' => 'Проект статус',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);

        // Аутентифицируемся
        $this->actingAs($user);

        // Делаем запрос с фильтром проекта
        $response = $this->get(route('tasks.index', ['project_id' => $project->id]));

        $response->assertOk();

        // Проверяем, что возвращаются статусы проекта
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];

        $this->assertCount(1, $taskStatuses);
        $this->assertEquals('Проект статус', $taskStatuses[0]['name']);
        $this->assertNull($taskStatuses[0]['sprint_id']);

        // Проверяем, что спринты тоже переданы
        $sprints = $response->viewData('page')['props']['sprints'];
        $this->assertIsArray($sprints);
    }

    /**
     * @test
     */
    public function it_returns_sprint_statuses_when_both_project_and_sprint_selected()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        // Создаем спринт
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);

        // Создаем статусы проекта
        $projectStatus = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => null,
            'name' => 'Проект статус',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);

        // Создаем статусы спринта
        $sprintStatus = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Спринт статус',
            'order' => 1,
            'color' => '#3b82f6',
            'is_custom' => true,
        ]);

        // Аутентифицируемся
        $this->actingAs($user);

        // Делаем запрос с фильтром проекта и спринта
        $response = $this->get(route('tasks.index', [
            'project_id' => $project->id,
            'sprint_id' => $sprint->id
        ]));

        $response->assertOk();

        // Проверяем, что возвращаются статусы спринта
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];

        $this->assertCount(1, $taskStatuses);
        $this->assertEquals('Спринт статус', $taskStatuses[0]['name']);
        $this->assertEquals($sprint->id, $taskStatuses[0]['sprint_id']);
    }

    /**
     * @test
     */
    public function it_returns_empty_statuses_when_no_project_selected()
    {
        // Создаем пользователя
        $user = User::factory()->create();

        // Аутентифицируемся
        $this->actingAs($user);

        // Делаем запрос без фильтра проекта
        $response = $this->get(route('tasks.index'));

        $response->assertOk();

        // Проверяем, что статусы пустые
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];
        $sprints = $response->viewData('page')['props']['sprints'];

        $this->assertEmpty($taskStatuses);
        $this->assertEmpty($sprints);
    }

    /**
     * @test
     */
    public function it_returns_project_statuses_when_sprint_doesnt_exist()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        // Создаем статусы проекта
        $projectStatus = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => null,
            'name' => 'Проект статус',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);

        // Аутентифицируемся
        $this->actingAs($user);

        // Делаем запрос с несуществующим спринтом
        $response = $this->get(route('tasks.index', [
            'project_id' => $project->id,
            'sprint_id' => 999 // Несуществующий спринт
        ]));

        $response->assertOk();

        // Проверяем, что возвращаются статусы проекта (фолбэк)
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];

        $this->assertCount(1, $taskStatuses);
        $this->assertEquals('Проект статус', $taskStatuses[0]['name']);
        $this->assertNull($taskStatuses[0]['sprint_id']);
    }

    /**
     * @test
     */
    public function it_filters_tasks_by_sprint_correctly()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        // Создаем спринты
        $sprint1 = Sprint::factory()->create(['project_id' => $project->id]);
        $sprint2 = Sprint::factory()->create(['project_id' => $project->id]);

        // Создаем статусы проекта
        $projectStatus = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => null,
            'name' => 'Проект статус',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);

        // Создаем задачи в разных спринтах
        $task1 = Task::factory()->create([
            'project_id' => $project->id,
            'sprint_id' => $sprint1->id,
            'status_id' => $projectStatus->id,
            'assignee_id' => $user->id,
            'reporter_id' => $user->id,
        ]);

        $task2 = Task::factory()->create([
            'project_id' => $project->id,
            'sprint_id' => $sprint2->id,
            'status_id' => $projectStatus->id,
            'assignee_id' => $user->id,
            'reporter_id' => $user->id,
        ]);

        $task3 = Task::factory()->create([
            'project_id' => $project->id,
            'sprint_id' => null, // Без спринта
            'status_id' => $projectStatus->id,
            'assignee_id' => $user->id,
            'reporter_id' => $user->id,
        ]);

        // Аутентифицируемся
        $this->actingAs($user);

        // Фильтруем задачи по первому спринту
        $response = $this->get(route('tasks.index', [
            'project_id' => $project->id,
            'sprint_id' => $sprint1->id
        ]));

        $response->assertOk();

        // Проверяем, что возвращается только задача из первого спринта
        $tasks = $response->viewData('page')['props']['tasks']['data'];

        $this->assertCount(1, $tasks);
        $this->assertEquals($task1->id, $tasks[0]['id']);
        $this->assertEquals($sprint1->id, $tasks[0]['sprint_id']);
    }
}
