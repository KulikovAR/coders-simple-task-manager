<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_new_comment(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post("/tasks/{$task->id}/comments", [
                'content' => 'Test comment content',
                'type' => 'comment'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Комментарий добавлен.');

        $this->assertDatabaseHas('task_comments', [
            'content' => 'Test comment content',
            'type' => 'comment',
            'user_id' => $user->id,
            'task_id' => $task->id,
        ]);
    }

    public function test_store_requires_authentication(): void
    {
        $project = Project::factory()->create();
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this->post("/tasks/{$task->id}/comments", [
            'content' => 'Test comment content',
            'type' => 'comment'
        ]);

        $response->assertRedirect('/login');
    }

    public function test_store_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post("/tasks/{$task->id}/comments", []);

        $response->assertSessionHasErrors(['content', 'type']);
    }

    public function test_store_creates_comment_with_different_types(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $types = ['general', 'testing_feedback', 'review_comment'];

        foreach ($types as $type) {
            $response = $this
                ->actingAs($user)
                ->post("/tasks/{$task->id}/comments", [
                    'content' => "Test {$type} content",
                    'type' => $type
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('success', 'Комментарий добавлен.');

            $this->assertDatabaseHas('task_comments', [
                'content' => "Test {$type} content",
                'type' => $type,
                'user_id' => $user->id,
                'task_id' => $task->id,
            ]);
        }
    }

    public function test_update_updates_comment(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => 'Original content',
            'type' => 'comment'
        ]);

        $response = $this
            ->actingAs($user)
            ->put("/comments/{$comment->id}", [
                'content' => 'Updated content',
                'type' => 'system'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Комментарий обновлен.');

        $comment->refresh();
        $this->assertEquals('Updated content', $comment->content);
        $this->assertEquals('system', $comment->type);
    }

    public function test_update_requires_authentication(): void
    {
        $comment = TaskComment::factory()->create();

        $response = $this->put("/comments/{$comment->id}", [
            'content' => 'Updated content',
            'type' => 'comment'
        ]);

        $response->assertRedirect('/login');
    }

    public function test_update_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $user->id
        ]);

        $response = $this
            ->actingAs($user)
            ->put("/comments/{$comment->id}", []);

        $response->assertSessionHasErrors(['content', 'type']);
    }

    public function test_update_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this
            ->actingAs($user)
            ->put("/comments/{$comment->id}", [
                'content' => 'Updated content',
                'type' => 'comment'
            ]);

        $response->assertForbidden();
    }

    public function test_destroy_deletes_comment(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $user->id
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/comments/{$comment->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Комментарий удален.');

        $this->assertDatabaseMissing('task_comments', ['id' => $comment->id]);
    }

    public function test_destroy_requires_authentication(): void
    {
        $comment = TaskComment::factory()->create();

        $response = $this->delete("/comments/{$comment->id}");

        $response->assertRedirect('/login');
    }

    public function test_destroy_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $otherUser->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/comments/{$comment->id}");

        $response->assertForbidden();
    }

    public function test_comment_belongs_to_correct_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task1 = Task::factory()->create(['project_id' => $project->id]);
        $task2 = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post("/tasks/{$task1->id}/comments", [
                'content' => 'Comment for task 1',
                'type' => 'comment'
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('task_comments', [
            'content' => 'Comment for task 1',
            'task_id' => $task1->id,
        ]);

        $this->assertDatabaseMissing('task_comments', [
            'content' => 'Comment for task 1',
            'task_id' => $task2->id,
        ]);
    }

    public function test_comment_has_correct_user_id(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user1->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user2)
            ->post("/tasks/{$task->id}/comments", [
                'content' => 'Comment from user 2',
                'type' => 'comment'
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('task_comments', [
            'content' => 'Comment from user 2',
            'user_id' => $user2->id,
            'task_id' => $task->id,
        ]);
    }

    public function test_comment_content_is_preserved(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $longContent = str_repeat('A', 1000); // Длинный контент

        $response = $this
            ->actingAs($user)
            ->post("/tasks/{$task->id}/comments", [
                'content' => $longContent,
                'type' => 'comment'
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('task_comments', [
            'content' => $longContent,
            'user_id' => $user->id,
            'task_id' => $task->id,
        ]);
    }

    public function test_comment_type_validation(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this
            ->actingAs($user)
            ->post("/tasks/{$task->id}/comments", [
                'content' => 'Test content',
                'type' => 'invalid_type'
            ]);

        $response->assertSessionHasErrors(['type']);
    }
}
