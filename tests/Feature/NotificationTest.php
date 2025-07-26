<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_notifications_page()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get(route('notifications.index'));
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications')
            ->has('unreadCount')
        );
    }

    public function test_user_can_get_unread_notifications()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();
        
        // Создаем непрочитанное уведомление
        Notification::factory()->create([
            'user_id' => $user->id,
            'notifiable_id' => $task->id,
            'notifiable_type' => Task::class,
            'read' => false,
        ]);

        $response = $this->actingAs($user)->getJson(route('notifications.unread'));
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'notifications',
            'unreadCount'
        ]);
        $this->assertEquals(1, $response->json('unreadCount'));
    }

    public function test_user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'notifiable_id' => $task->id,
            'notifiable_type' => Task::class,
            'read' => false,
        ]);

        $response = $this->actingAs($user)->postJson(route('notifications.mark-as-read', $notification->id));
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'read' => true,
        ]);
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();
        
        // Создаем несколько непрочитанных уведомлений
        Notification::factory()->count(3)->create([
            'user_id' => $user->id,
            'notifiable_id' => $task->id,
            'notifiable_type' => Task::class,
            'read' => false,
        ]);

        $response = $this->actingAs($user)->postJson(route('notifications.mark-all-as-read'));
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $user->id,
            'read' => false,
        ]);
    }

    public function test_user_can_delete_notification()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'notifiable_id' => $task->id,
            'notifiable_type' => Task::class,
        ]);

        $response = $this->actingAs($user)->deleteJson(route('notifications.destroy', $notification->id));
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        
        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    }

    public function test_user_cannot_access_other_user_notification()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $task = Task::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user1->id,
            'notifiable_id' => $task->id,
            'notifiable_type' => Task::class,
        ]);

        $response = $this->actingAs($user2)->postJson(route('notifications.mark-as-read', $notification->id));
        
        $response->assertStatus(403);
    }

    public function test_notification_service_creates_task_assigned_notification()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['assignee_id' => $user->id]);
        $fromUser = User::factory()->create();
        
        $notificationService = app(NotificationService::class);
        $notificationService->taskAssigned($task, $user, $fromUser);

        $this->assertDatabaseHas('notifications', [
            'type' => Notification::TYPE_TASK_ASSIGNED,
            'user_id' => $user->id,
            'from_user_id' => $fromUser->id,
            'notifiable_type' => Task::class,
            'notifiable_id' => $task->id,
        ]);
    }

    public function test_notification_service_creates_task_moved_notification()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['assignee_id' => $user->id]);
        $fromUser = User::factory()->create();
        
        $notificationService = app(NotificationService::class);
        $notificationService->taskMoved($task, 'Новая', 'В работе', $fromUser);

        $this->assertDatabaseHas('notifications', [
            'type' => Notification::TYPE_TASK_MOVED,
            'user_id' => $user->id,
            'from_user_id' => $fromUser->id,
            'notifiable_type' => Task::class,
            'notifiable_id' => $task->id,
        ]);
    }

    public function test_notification_model_returns_correct_message()
    {
        $notification = Notification::factory()->taskAssigned()->create([
            'data' => [
                'task_title' => 'Тестовая задача',
                'project_name' => 'Тестовый проект',
            ],
        ]);

        $message = $notification->getMessage();
        $this->assertStringContainsString('Тестовая задача', $message);
        $this->assertStringContainsString('назначена', $message);
    }

    public function test_notification_model_returns_correct_icon()
    {
        $notification = Notification::factory()->taskAssigned()->create();
        
        $icon = $notification->getIcon();
        $this->assertEquals('🎯', $icon);
    }

    public function test_notification_model_returns_correct_color()
    {
        $notification = Notification::factory()->taskAssigned()->create();
        
        $color = $notification->getColor();
        $this->assertEquals('text-blue-500', $color);
    }

    public function test_notification_can_be_marked_as_read()
    {
        $notification = Notification::factory()->unread()->create();
        
        $this->assertFalse($notification->isRead());
        
        $notification->markAsRead();
        
        $this->assertTrue($notification->isRead());
        $this->assertNotNull($notification->read_at);
    }

    public function test_notification_can_be_marked_as_unread()
    {
        $notification = Notification::factory()->read()->create();
        
        $this->assertTrue($notification->isRead());
        
        $notification->markAsUnread();
        
        $this->assertFalse($notification->isRead());
        $this->assertNull($notification->read_at);
    }
}
