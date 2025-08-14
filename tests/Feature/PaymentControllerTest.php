<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_start_payment_creates_payment_record(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'test_payment_id',
                'confirmation' => [
                    'confirmation_url' => 'https://test.com/pay'
                ]
            ], 200)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'confirmation_url' => 'https://test.com/pay'
        ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 2000.00,
            'status' => 'pending',
        ]);
    }

    public function test_start_payment_requires_authentication(): void
    {
        $response = $this->post('/payment/start');

        $response->assertRedirect('/login');
    }

    public function test_start_payment_handles_yookassa_failure(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([], 500)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertStatus(500);
        $response->assertJson([
            'success' => false,
            'message' => 'Ошибка создания платежа'
        ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 2000.00,
            'status' => 'failed',
        ]);
    }

    public function test_start_payment_sets_correct_amount(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'test_payment_id',
                'confirmation' => [
                    'confirmation_url' => 'https://test.com/pay'
                ]
            ], 200)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertOk();

        $payment = Payment::where('user_id', $user->id)->first();
        $this->assertEquals(2000.00, $payment->amount);
    }

    public function test_start_payment_sets_correct_currency(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'test_payment_id',
                'confirmation' => [
                    'confirmation_url' => 'https://test.com/pay'
                ]
            ], 200)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertOk();

        // Проверяем, что в запросе к YooKassa передается правильная валюта
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.yookassa.ru/v3/payments' &&
                   $request['amount']['currency'] === 'RUB';
        });
    }

    public function test_start_payment_sets_correct_description(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'test_payment_id',
                'confirmation' => [
                    'confirmation_url' => 'https://test.com/pay'
                ]
            ], 200)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertOk();

        // Проверяем, что в запросе к YooKassa передается правильное описание
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.yookassa.ru/v3/payments' &&
                   $request['description'] === 'Подписка на ИИ-ассистента';
        });
    }

    public function test_start_payment_sets_metadata(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'test_payment_id',
                'confirmation' => [
                    'confirmation_url' => 'https://test.com/pay'
                ]
            ], 200)
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/payment/start');

        $response->assertOk();

        $payment = Payment::where('user_id', $user->id)->first();

        // Проверяем, что в запросе к YooKassa передаются правильные метаданные
        Http::assertSent(function ($request) use ($payment, $user) {
            return $request->url() === 'https://api.yookassa.ru/v3/payments' &&
                   $request['metadata']['payment_id'] == $payment->id &&
                   $request['metadata']['user_id'] == $user->id;
        });
    }

    public function test_webhook_processes_succeeded_payment(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $user->id,
            'payment_id' => 'test_payment_id',
            'status' => 'pending'
        ]);

        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => [
                'id' => 'test_payment_id',
                'status' => 'succeeded'
            ]
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $payment->refresh();
        $user->refresh();

        $this->assertEquals('succeeded', $payment->status);
        $this->assertTrue($user->paid);
        $this->assertNotNull($user->expires_at);
        $this->assertEquals($payment->expires_at, $user->expires_at);
    }

    public function test_webhook_processes_failed_payment(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $user->id,
            'payment_id' => 'test_payment_id',
            'status' => 'pending'
        ]);

        $response = $this->post('/payment/webhook', [
            'event' => 'payment.canceled',
            'object' => [
                'id' => 'test_payment_id',
                'status' => 'canceled'
            ]
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $payment->refresh();
        $user->refresh();

        $this->assertEquals('canceled', $payment->status);
        $this->assertFalse($user->paid);
        $this->assertNull($user->expires_at);
    }

    public function test_webhook_handles_missing_object(): void
    {
        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded'
        ]);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Некорректные данные'
        ]);
    }

    public function test_webhook_handles_missing_object_id(): void
    {
        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => []
        ]);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Некорректные данные'
        ]);
    }

    public function test_webhook_handles_payment_not_found(): void
    {
        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => [
                'id' => 'non_existent_payment_id',
                'status' => 'succeeded'
            ]
        ]);

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'Платеж не найден'
        ]);
    }

    public function test_webhook_updates_payment_data(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $user->id,
            'payment_id' => 'test_payment_id',
            'status' => 'pending'
        ]);

        $webhookData = [
            'id' => 'test_payment_id',
            'status' => 'succeeded',
            'amount' => 2000.00,
            'currency' => 'RUB'
        ];

        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => $webhookData
        ]);

        $response->assertOk();

        $payment->refresh();
        $this->assertEquals($webhookData, $payment->data);
    }

    public function test_webhook_sets_expires_at_for_succeeded_payment(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $user->id,
            'payment_id' => 'test_payment_id',
            'status' => 'pending'
        ]);

        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => [
                'id' => 'test_payment_id',
                'status' => 'succeeded'
            ]
        ]);

        $response->assertOk();

        $payment->refresh();
        $user->refresh();

        $this->assertNotNull($payment->expires_at);
        $this->assertEquals($payment->expires_at, $user->expires_at);
        
        // Проверяем, что expires_at установлен примерно на месяц вперед
        $this->assertGreaterThan(now()->addDays(25), $payment->expires_at);
        $this->assertLessThan(now()->addDays(35), $payment->expires_at);
    }

    public function test_webhook_does_not_require_authentication(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $user->id,
            'payment_id' => 'test_payment_id',
            'status' => 'pending'
        ]);

        $response = $this->post('/payment/webhook', [
            'event' => 'payment.succeeded',
            'object' => [
                'id' => 'test_payment_id',
                'status' => 'succeeded'
            ]
        ]);

        $response->assertOk();
    }
}
