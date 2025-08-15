<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SprintStatusEditingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function it_can_edit_existing_sprint_statuses_without_deleting_them()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        
        // Создаем спринт
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        
        // Создаем кастомные статусы для спринта
        $status1 = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Спринт статус 1',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => true,
        ]);
        
        $status2 = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Спринт статус 2',
            'order' => 2,
            'color' => '#3b82f6',
            'is_custom' => true,
        ]);
        
        // Аутентифицируемся
        $this->actingAs($user);
        
        // Обновляем статусы спринта (изменяем названия и цвета)
        $response = $this->putJson(route('sprints.statuses.update', [$project->id, $sprint->id]), [
            'statuses' => [
                [
                    'id' => $status1->id,
                    'name' => 'Обновленный статус 1',
                    'color' => '#10b981',
                ],
                [
                    'id' => $status2->id,
                    'name' => 'Обновленный статус 2',
                    'color' => '#ef4444',
                ],
            ]
        ]);
        
        $response->assertOk();
        
        // Проверяем, что статусы обновились, а не были пересозданы
        $updatedStatus1 = TaskStatus::find($status1->id);
        $updatedStatus2 = TaskStatus::find($status2->id);
        
        $this->assertNotNull($updatedStatus1);
        $this->assertNotNull($updatedStatus2);
        
        $this->assertEquals('Обновленный статус 1', $updatedStatus1->name);
        $this->assertEquals('#10b981', $updatedStatus1->color);
        $this->assertEquals(1, $updatedStatus1->order);
        
        $this->assertEquals('Обновленный статус 2', $updatedStatus2->name);
        $this->assertEquals('#ef4444', $updatedStatus2->color);
        $this->assertEquals(2, $updatedStatus2->order);
        
        // Проверяем, что общее количество статусов спринта не изменилось
        $this->assertEquals(2, TaskStatus::where('sprint_id', $sprint->id)->count());
    }
    
    /**
     * @test
     */
    public function it_can_add_new_status_to_existing_sprint_statuses()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        
        // Создаем спринт
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        
        // Создаем кастомный статус для спринта
        $status1 = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Существующий статус',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => true,
        ]);
        
        // Аутентифицируемся
        $this->actingAs($user);
        
        // Обновляем статусы спринта (оставляем старый + добавляем новый)
        $response = $this->putJson(route('sprints.statuses.update', [$project->id, $sprint->id]), [
            'statuses' => [
                [
                    'id' => $status1->id,
                    'name' => 'Существующий статус',
                    'color' => '#f59e0b',
                ],
                [
                    'id' => null, // Новый статус
                    'name' => 'Новый статус',
                    'color' => '#3b82f6',
                ],
            ]
        ]);
        
        $response->assertOk();
        
        // Проверяем, что старый статус сохранился
        $updatedStatus1 = TaskStatus::find($status1->id);
        $this->assertNotNull($updatedStatus1);
        $this->assertEquals('Существующий статус', $updatedStatus1->name);
        
        // Проверяем, что новый статус создался
        $newStatus = TaskStatus::where('sprint_id', $sprint->id)
            ->where('name', 'Новый статус')
            ->first();
        $this->assertNotNull($newStatus);
        $this->assertEquals(2, $newStatus->order);
        
        // Проверяем общее количество статусов
        $this->assertEquals(2, TaskStatus::where('sprint_id', $sprint->id)->count());
    }
    
    /**
     * @test
     */
    public function it_prevents_deletion_of_status_with_tasks()
    {
        // Создаем пользователя и проект
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        
        // Создаем спринт
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        
        // Создаем кастомные статусы для спринта
        $status1 = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Статус с задачей',
            'order' => 1,
            'color' => '#f59e0b',
            'is_custom' => true,
        ]);
        
        $status2 = TaskStatus::create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'name' => 'Статус без задач',
            'order' => 2,
            'color' => '#3b82f6',
            'is_custom' => true,
        ]);
        
        // Создаем задачу с первым статусом
        $task = \App\Models\Task::factory()->create([
            'project_id' => $project->id,
            'sprint_id' => $sprint->id,
            'status_id' => $status1->id,
            'assignee_id' => $user->id,
            'reporter_id' => $user->id,
        ]);
        
        // Аутентифицируемся
        $this->actingAs($user);
        
        // Пытаемся обновить статусы, исключив status1 (что означает его удаление)
        $response = $this->putJson(route('sprints.statuses.update', [$project->id, $sprint->id]), [
            'statuses' => [
                [
                    'id' => $status2->id,
                    'name' => 'Статус без задач',
                    'color' => '#3b82f6',
                ],
            ]
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Нельзя удалить статусы "Статус с задачей", так как в них есть задачи. Сначала переместите задачи в другие статусы.']);
        
        // Проверяем, что оба статуса остались
        $this->assertTrue(TaskStatus::where('id', $status1->id)->exists());
        $this->assertTrue(TaskStatus::where('id', $status2->id)->exists());
    }
}
