<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/notifications');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications')
            ->has('unreadCount')
        );
    }

    public function test_index_requires_authentication(): void
    {
        $response = $this->get('/notifications');

        $response->assertRedirect('/login');
    }

    public function test_get_unread_returns_unread_notifications(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'read' => false
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/notifications/unread');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'unreadCount' => 1
        ]);
        $response->assertJsonStructure([
            'success',
            'notifications',
            'unreadCount'
        ]);
    }

    public function test_get_unread_requires_authentication(): void
    {
        $response = $this->get('/notifications/unread');

        $response->assertRedirect('/login');
    }

    public function test_get_unread_limits_to_10_notifications(): void
    {
        $user = User::factory()->create();
        
        // Создаем 15 непрочитанных уведомлений
        for ($i = 0; $i < 15; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get('/notifications/unread');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'unreadCount' => 15
        ]);
        
        $data = $response->json();
        $this->assertCount(10, $data['notifications']);
    }

    public function test_mark_as_read_marks_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'read' => false
        ]);

        $response = $this
            ->actingAs($user)
            ->post("/notifications/{$notification->id}/read");

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);
        $response->assertJsonStructure([
            'success',
            'unreadCount'
        ]);

        $notification->refresh();
        $this->assertTrue($notification->read);
    }

    public function test_mark_as_read_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $otherUser->id,
            'read' => false
        ]);

        $response = $this
            ->actingAs($user)
            ->post("/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }

    public function test_mark_as_read_requires_authentication(): void
    {
        $notification = Notification::factory()->create();

        $response = $this->post("/notifications/{$notification->id}/read");

        $response->assertRedirect('/login');
    }

    public function test_mark_as_read_updates_unread_count(): void
    {
        $user = User::factory()->create();
        
        // Создаем 3 непрочитанных уведомления
        for ($i = 0; $i < 3; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $notification = $user->notifications()->first();

        $response = $this
            ->actingAs($user)
            ->post("/notifications/{$notification->id}/read");

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'unreadCount' => 2
        ]);
    }

    public function test_mark_all_as_read_marks_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        
        // Создаем несколько непрочитанных уведомлений
        for ($i = 0; $i < 5; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->post('/notifications/mark-all-read');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'unreadCount' => 0
        ]);

        // Проверяем, что все уведомления помечены как прочитанные
        $this->assertEquals(0, $user->notifications()->where('read', false)->count());
    }

    public function test_mark_all_as_read_requires_authentication(): void
    {
        $response = $this->post('/notifications/mark-all-read');

        $response->assertRedirect('/login');
    }

    public function test_destroy_deletes_notification(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/notifications/{$notification->id}");

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_destroy_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/notifications/{$notification->id}");

        $response->assertForbidden();
    }

    public function test_destroy_requires_authentication(): void
    {
        $notification = Notification::factory()->create();

        $response = $this->delete("/notifications/{$notification->id}");

        $response->assertRedirect('/login');
    }

    public function test_destroy_updates_unread_count(): void
    {
        $user = User::factory()->create();
        
        // Создаем 3 непрочитанных уведомления
        for ($i = 0; $i < 3; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $notification = $user->notifications()->first();

        $response = $this
            ->actingAs($user)
            ->delete("/notifications/{$notification->id}");

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'unreadCount' => 2
        ]);
    }

    public function test_destroy_read_deletes_all_read_notifications(): void
    {
        $user = User::factory()->create();
        
        // Создаем прочитанные и непрочитанные уведомления
        for ($i = 0; $i < 3; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => true
            ]);
        }
        
        for ($i = 0; $i < 2; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->delete('/notifications/destroy-read');

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);

        // Проверяем, что прочитанные уведомления удалены, а непрочитанные остались
        $this->assertEquals(0, $user->notifications()->where('read', true)->count());
        $this->assertEquals(2, $user->notifications()->where('read', false)->count());
    }

    public function test_destroy_read_requires_authentication(): void
    {
        $response = $this->delete('/notifications/destroy-read');

        $response->assertRedirect('/login');
    }

    public function test_notifications_are_limited_to_50_on_index(): void
    {
        $user = User::factory()->create();
        
        // Создаем 60 уведомлений
        for ($i = 0; $i < 60; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get('/notifications');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications', 50)
            ->has('unreadCount')
        );
    }

    public function test_unread_count_is_correct(): void
    {
        $user = User::factory()->create();
        
        // Создаем 5 прочитанных и 3 непрочитанных уведомления
        for ($i = 0; $i < 5; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => true
            ]);
        }
        
        for ($i = 0; $i < 3; $i++) {
            Notification::factory()->create([
                'user_id' => $user->id,
                'read' => false
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get('/notifications');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('unreadCount', 3)
        );
    }
}
