<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Webhook>
 */
class WebhookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'url' => $this->faker->url(),
            'secret' => Webhook::generateSecret(),
            'events' => $this->faker->randomElements(
                array_keys(Webhook::EVENTS),
                $this->faker->numberBetween(1, 3)
            ),
            'headers' => [
                'Authorization' => 'Bearer ' . $this->faker->sha256(),
                'X-Custom-Header' => $this->faker->word(),
            ],
            'is_active' => $this->faker->boolean(80), // 80% активных
            'retry_count' => $this->faker->numberBetween(0, 5),
            'timeout' => $this->faker->numberBetween(10, 120),
        ];
    }

    /**
     * Indicate that the webhook is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the webhook is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the webhook listens to task events.
     */
    public function taskEvents(): static
    {
        return $this->state(fn (array $attributes) => [
            'events' => ['task.created', 'task.updated', 'task.assigned'],
        ]);
    }

    /**
     * Indicate that the webhook listens to project events.
     */
    public function projectEvents(): static
    {
        return $this->state(fn (array $attributes) => [
            'events' => ['project.created', 'project.updated'],
        ]);
    }
}
