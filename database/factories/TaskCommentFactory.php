<?php

namespace Database\Factories;

use App\Enums\CommentType;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaskComment>
 */
class TaskCommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),
            'user_id' => User::factory(),
            'content' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(CommentType::cases()),
        ];
    }

    /**
     * Создать комментарий определенного типа
     */
    public function type(CommentType $type): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
        ]);
    }

    /**
     * Создать общий комментарий
     */
    public function general(): static
    {
        return $this->type(CommentType::GENERAL);
    }

    /**
     * Создать комментарий тестирования
     */
    public function testingFeedback(): static
    {
        return $this->type(CommentType::TESTING_FEEDBACK);
    }

    /**
     * Создать комментарий ревью
     */
    public function reviewComment(): static
    {
        return $this->type(CommentType::REVIEW_COMMENT);
    }

    /**
     * Создать отчет об ошибке
     */
    public function bugReport(): static
    {
        return $this->type(CommentType::BUG_REPORT);
    }

    /**
     * Создать запрос функции
     */
    public function featureRequest(): static
    {
        return $this->type(CommentType::FEATURE_REQUEST);
    }
}
