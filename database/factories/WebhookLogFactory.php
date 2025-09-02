<?php

namespace Database\Factories;

use App\Models\Webhook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WebhookLog>
 */
class WebhookLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement([200, 201, 400, 401, 403, 404, 500, 502, 503]);
        
        return [
            'webhook_id' => Webhook::factory(),
            'event' => $this->faker->randomElement([
                'task.created',
                'task.updated',
                'task.assigned',
                'project.created',
                'project.updated',
                'sprint.created',
                'comment.created',
            ]),
            'payload' => [
                'task' => [
                    'id' => $this->faker->numberBetween(1, 1000),
                    'title' => $this->faker->sentence(),
                    'description' => $this->faker->paragraph(),
                    'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
                ],
                'project' => [
                    'id' => $this->faker->numberBetween(1, 100),
                    'name' => $this->faker->words(3, true),
                ],
            ],
            'response_status' => $status,
            'response_body' => $status >= 200 && $status < 300 
                ? ['status' => 'success', 'message' => 'OK']
                : ['error' => 'Error occurred', 'message' => 'Something went wrong'],
            'execution_time' => $this->faker->numberBetween(50, 2000),
            'error_message' => $status >= 400 ? $this->faker->sentence() : null,
            'attempts' => $this->faker->numberBetween(1, 3),
            'executed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }

    /**
     * Indicate that the webhook log is successful.
     */
    public function successful(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_status' => $this->faker->randomElement([200, 201, 202]),
            'response_body' => ['status' => 'success', 'message' => 'OK'],
            'error_message' => null,
        ]);
    }

    /**
     * Indicate that the webhook log failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_status' => $this->faker->randomElement([400, 401, 403, 404, 500, 502, 503]),
            'response_body' => ['error' => 'Error occurred', 'message' => 'Something went wrong'],
            'error_message' => $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the webhook log timed out.
     */
    public function timeout(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_status' => null,
            'response_body' => null,
            'error_message' => 'Connection timeout',
            'execution_time' => $this->faker->numberBetween(30000, 60000),
        ]);
    }
}
