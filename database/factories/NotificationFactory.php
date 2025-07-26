<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            Notification::TYPE_TASK_ASSIGNED,
            Notification::TYPE_TASK_MOVED,
            Notification::TYPE_TASK_CREATED,
            Notification::TYPE_TASK_UPDATED,
            Notification::TYPE_COMMENT_ADDED,
            Notification::TYPE_SPRINT_STARTED,
            Notification::TYPE_SPRINT_ENDED,
            Notification::TYPE_PROJECT_INVITED,
            Notification::TYPE_DEADLINE_APPROACHING,
            Notification::TYPE_DEADLINE_OVERDUE,
        ];

        $type = $this->faker->randomElement($types);
        $task = Task::factory()->create();
        $user = User::factory()->create();
        $fromUser = User::factory()->create();

        $data = $this->getDataForType($type, $task);

        return [
            'type' => $type,
            'user_id' => $user->id,
            'from_user_id' => $fromUser->id,
            'notifiable_type' => Task::class,
            'notifiable_id' => $task->id,
            'data' => $data,
            'read' => $this->faker->boolean(20), // 20% прочитанных
            'read_at' => $this->faker->optional(0.2)->dateTimeBetween('-1 week', 'now'),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    /**
     * Получить данные для конкретного типа уведомления
     */
    private function getDataForType(string $type, Task $task): array
    {
        return match ($type) {
            Notification::TYPE_TASK_ASSIGNED => [
                'task_title' => $task->title,
                'project_name' => $task->project?->name ?? 'Тестовый проект',
            ],
            Notification::TYPE_TASK_MOVED => [
                'task_title' => $task->title,
                'status' => $this->faker->randomElement(['В работе', 'На проверке', 'Готово']),
                'old_status' => $this->faker->randomElement(['Новая', 'В работе', 'На проверке']),
            ],
            Notification::TYPE_TASK_CREATED => [
                'task_title' => $task->title,
                'project_name' => $task->project?->name ?? 'Тестовый проект',
            ],
            Notification::TYPE_TASK_UPDATED => [
                'task_title' => $task->title,
            ],
            Notification::TYPE_COMMENT_ADDED => [
                'task_title' => $task->title,
                'comment_preview' => $this->faker->sentence(10) . '...',
            ],
            Notification::TYPE_SPRINT_STARTED => [
                'sprint_name' => $this->faker->words(2, true),
                'project_name' => $task->project?->name ?? 'Тестовый проект',
            ],
            Notification::TYPE_SPRINT_ENDED => [
                'sprint_name' => $this->faker->words(2, true),
                'project_name' => $task->project?->name ?? 'Тестовый проект',
            ],
            Notification::TYPE_PROJECT_INVITED => [
                'project_name' => $task->project?->name ?? 'Тестовый проект',
            ],
            Notification::TYPE_DEADLINE_APPROACHING => [
                'task_title' => $task->title,
                'deadline' => $this->faker->dateTimeBetween('now', '+2 days')->format('Y-m-d H:i:s'),
            ],
            Notification::TYPE_DEADLINE_OVERDUE => [
                'task_title' => $task->title,
                'deadline' => $this->faker->dateTimeBetween('-3 days', '-1 day')->format('Y-m-d H:i:s'),
            ],
            default => [],
        };
    }

    /**
     * Уведомление о назначении задачи
     */
    public function taskAssigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Notification::TYPE_TASK_ASSIGNED,
        ]);
    }

    /**
     * Уведомление о перемещении задачи
     */
    public function taskMoved(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Notification::TYPE_TASK_MOVED,
        ]);
    }

    /**
     * Уведомление о создании задачи
     */
    public function taskCreated(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Notification::TYPE_TASK_CREATED,
        ]);
    }

    /**
     * Уведомление о комментарии
     */
    public function commentAdded(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Notification::TYPE_COMMENT_ADDED,
        ]);
    }

    /**
     * Непрочитанное уведомление
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Прочитанное уведомление
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read' => true,
            'read_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }
}
