<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
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
            'sprint_id' => Sprint::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'assignee_id' => User::factory(),
            'reporter_id' => User::factory(),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'status_id' => TaskStatus::factory(),
        ];
    }
}
