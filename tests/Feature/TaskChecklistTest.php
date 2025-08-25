<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskChecklistTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $project;
    protected $task;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        $this->task = Task::factory()->create([
            'project_id' => $this->project->id,
            'reporter_id' => $this->user->id
        ]);
    }

    public function test_user_can_view_task_checklists()
    {
        $checklist = TaskChecklist::factory()->create(['task_id' => $this->task->id]);

        $response = $this->actingAs($this->user)
            ->get(route('tasks.checklists.index', $this->task));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'checklists' => [
                [
                    'id' => $checklist->id,
                    'title' => $checklist->title,
                    'is_completed' => $checklist->is_completed
                ]
            ]
        ]);
    }

    public function test_user_can_create_checklist_item()
    {
        $checklistData = ['title' => 'Новый пункт чек-листа'];

        $response = $this->actingAs($this->user)
            ->postJson(route('tasks.checklists.store', $this->task), $checklistData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Чек-лист успешно создан'
        ]);

        $this->assertDatabaseHas('task_checklists', [
            'task_id' => $this->task->id,
            'title' => 'Новый пункт чек-листа',
            'is_completed' => false
        ]);
    }

    public function test_user_can_toggle_checklist_item_status()
    {
        $checklist = TaskChecklist::factory()->create([
            'task_id' => $this->task->id,
            'is_completed' => false
        ]);

        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.checklists.toggle', [$this->task, $checklist]));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Статус чек-листа успешно обновлен'
        ]);

        $this->assertDatabaseHas('task_checklists', [
            'id' => $checklist->id,
            'is_completed' => true
        ]);
    }

    public function test_user_can_update_checklist_item()
    {
        $checklist = TaskChecklist::factory()->create(['task_id' => $this->task->id]);
        $updateData = ['title' => 'Обновленный заголовок'];

        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.checklists.update', [$this->task, $checklist]), $updateData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Чек-лист успешно обновлен'
        ]);

        $this->assertDatabaseHas('task_checklists', [
            'id' => $checklist->id,
            'title' => 'Обновленный заголовок'
        ]);
    }

    public function test_user_can_delete_checklist_item()
    {
        $checklist = TaskChecklist::factory()->create(['task_id' => $this->task->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson(route('tasks.checklists.destroy', [$this->task, $checklist]));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Чек-лист успешно удален'
        ]);

        $this->assertDatabaseMissing('task_checklists', ['id' => $checklist->id]);
    }

    public function test_user_can_reorder_checklists()
    {
        $checklist1 = TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 1]);
        $checklist2 = TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 2]);
        $checklist3 = TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 3]);

        $reorderData = [
            'checklist_ids' => [$checklist3->id, $checklist1->id, $checklist2->id]
        ];

        $response = $this->actingAs($this->user)
            ->putJson(route('tasks.checklists.reorder', $this->task), $reorderData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Порядок чек-листов успешно обновлен'
        ]);

        // Проверяем новый порядок
        $this->assertDatabaseHas('task_checklists', [
            'id' => $checklist3->id,
            'sort_order' => 1
        ]);
        $this->assertDatabaseHas('task_checklists', [
            'id' => $checklist1->id,
            'sort_order' => 2
        ]);
        $this->assertDatabaseHas('task_checklists', [
            'id' => $checklist2->id,
            'sort_order' => 3
        ]);
    }

    public function test_checklist_items_are_ordered_by_sort_order()
    {
        TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 3]);
        TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 1]);
        TaskChecklist::factory()->create(['task_id' => $this->task->id, 'sort_order' => 2]);

        $response = $this->actingAs($this->user)
            ->get(route('tasks.checklists.index', $this->task));

        $response->assertStatus(200);
        
        $checklists = $response->json('checklists');
        $this->assertEquals(1, $checklists[0]['sort_order']);
        $this->assertEquals(2, $checklists[1]['sort_order']);
        $this->assertEquals(3, $checklists[2]['sort_order']);
    }

    public function test_unauthorized_user_cannot_access_checklists()
    {
        $unauthorizedUser = User::factory()->create();
        
        $response = $this->actingAs($unauthorizedUser)
            ->get(route('tasks.checklists.index', $this->task));

        $response->assertStatus(403);
    }
}
