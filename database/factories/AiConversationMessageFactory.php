<?php

namespace Database\Factories;

use App\Models\AiConversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiConversationMessage>
 */
class AiConversationMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['user', 'ai']);
        
        return [
            'conversation_id' => AiConversation::factory(),
            'type' => $type,
            'content' => $type === 'user' 
                ? $this->faker->sentence()
                : $this->faker->paragraph(),
            'success' => $type === 'ai' ? $this->faker->boolean(85) : true, // 85% успешных AI ответов
            'commands_executed' => $type === 'ai' ? $this->faker->numberBetween(0, 5) : 0,
            'results' => $type === 'ai' ? $this->generateResults() : null,
            'processing_time' => $type === 'ai' ? $this->faker->randomFloat(2, 0.1, 5.0) : null,
        ];
    }

    /**
     * Создать сообщение пользователя
     */
    public function userMessage(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'user',
            'success' => true,
            'commands_executed' => 0,
            'results' => null,
            'processing_time' => null,
        ]);
    }

    /**
     * Создать сообщение AI
     */
    public function aiMessage(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'ai',
            'success' => $this->faker->boolean(85),
            'commands_executed' => $this->faker->numberBetween(1, 5),
            'results' => $this->generateResults(),
            'processing_time' => $this->faker->randomFloat(2, 0.1, 5.0),
        ]);
    }

    /**
     * Создать успешное сообщение AI
     */
    public function successful(): static
    {
        return $this->state(fn (array $attributes) => [
            'success' => true,
        ]);
    }

    /**
     * Создать неуспешное сообщение AI
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'success' => false,
            'commands_executed' => 0,
            'results' => ['error' => 'Произошла ошибка при обработке запроса'],
        ]);
    }

    /**
     * Генерировать результаты для AI сообщения
     */
    private function generateResults(): array
    {
        return [
            'tasks_created' => $this->faker->numberBetween(0, 3),
            'tasks_updated' => $this->faker->numberBetween(0, 5),
            'commands_executed' => $this->faker->numberBetween(1, 10),
            'response_quality' => $this->faker->randomElement(['excellent', 'good', 'satisfactory']),
        ];
    }
}
