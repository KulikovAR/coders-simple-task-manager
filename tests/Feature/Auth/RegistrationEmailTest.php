<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_notification_is_sent_on_registration(): void
    {
        Notification::fake();

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->post('/register', $userData);

        $response->assertRedirect('/dashboard');

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_email_verification_notification_is_not_sent_for_google_users(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Google User',
            'email' => 'google@example.com',
            'google_id' => '123456789',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->hasVerifiedEmail());
        Notification::assertNothingSent();
    }

    public function test_email_verification_notification_is_sent_on_login_for_unverified_users(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->assertNull($user->email_verified_at);
        $this->assertFalse($user->hasVerifiedEmail());

        $response = $this->post('/login', [
            'email' => 'unverified@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_email_verification_notification_is_not_sent_on_login_for_verified_users(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Verified User',
            'email' => 'verified@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->hasVerifiedEmail());

        $response = $this->post('/login', [
            'email' => 'verified@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        Notification::assertNothingSent();
    }
}
