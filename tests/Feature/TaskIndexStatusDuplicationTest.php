<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\TaskStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskIndexStatusDuplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function it_does_not_duplicate_statuses_with_same_names_on_task_index_page()
    {
        // Создаем пользователя
        $user = User::factory()->create();
        
        // Создаем два проекта
        $project1 = Project::factory()->create(['owner_id' => $user->id]);
        $project2 = Project::factory()->create(['owner_id' => $user->id]);
        
        // Создаем статусы с одинаковыми именами в разных проектах
        TaskStatus::create([
            'project_id' => $project1->id,
            'name' => 'К выполнению',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);
        
        TaskStatus::create([
            'project_id' => $project1->id,
            'name' => 'В работе',
            'order' => 2,
            'color' => '#3b82f6',
            'is_custom' => false,
        ]);
        
        TaskStatus::create([
            'project_id' => $project2->id,
            'name' => 'К выполнению', // Дублирующее название
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);
        
        TaskStatus::create([
            'project_id' => $project2->id,
            'name' => 'Выполнено', // Уникальное название
            'order' => 3,
            'color' => '#10b981',
            'is_custom' => false,
        ]);
        
        // Аутентифицируемся
        $this->actingAs($user);
        
        // Переходим на страницу задач
        $response = $this->get(route('tasks.index'));
        
        $response->assertOk();
        
        // Получаем статусы из ответа
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];
        
        // Проверяем, что нет дублирующихся статусов по имени
        $statusNames = collect($taskStatuses)->pluck('name')->toArray();
        $uniqueStatusNames = array_unique($statusNames);
        
        $this->assertEquals(
            count($uniqueStatusNames), 
            count($statusNames),
            'Найдены дублирующиеся статусы по именам: ' . implode(', ', array_diff_assoc($statusNames, $uniqueStatusNames))
        );
        
        // Проверяем, что есть все ожидаемые уникальные статусы
        $expectedStatusNames = ['К выполнению', 'В работе', 'Выполнено'];
        sort($expectedStatusNames);
        sort($uniqueStatusNames);
        
        $this->assertEquals($expectedStatusNames, $uniqueStatusNames);
    }
    
    /**
     * @test
     */
    public function it_preserves_order_when_removing_duplicates()
    {
        // Создаем пользователя
        $user = User::factory()->create();
        
        // Создаем проект
        $project = Project::factory()->create(['owner_id' => $user->id]);
        
        // Создаем статусы с разными порядками
        TaskStatus::create([
            'project_id' => $project->id,
            'name' => 'Статус A',
            'order' => 3,
            'color' => '#f59e0b',
            'is_custom' => false,
        ]);
        
        TaskStatus::create([
            'project_id' => $project->id,
            'name' => 'Статус B',
            'order' => 1,
            'color' => '#3b82f6',
            'is_custom' => false,
        ]);
        
        TaskStatus::create([
            'project_id' => $project->id,
            'name' => 'Статус C',
            'order' => 2,
            'color' => '#10b981',
            'is_custom' => false,
        ]);
        
        // Аутентифицируемся
        $this->actingAs($user);
        
        // Переходим на страницу задач
        $response = $this->get(route('tasks.index'));
        
        $response->assertOk();
        
        // Получаем статусы из ответа
        $taskStatuses = $response->viewData('page')['props']['taskStatuses'];
        
        // Проверяем, что статусы отсортированы по order
        $statusNames = collect($taskStatuses)->pluck('name')->toArray();
        $expectedOrder = ['Статус B', 'Статус C', 'Статус A']; // По order: 1, 2, 3
        
        $this->assertEquals($expectedOrder, $statusNames);
    }
}
