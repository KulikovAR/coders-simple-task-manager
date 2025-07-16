<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sprint>
 */
class SprintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');
        
        return [
            'project_id' => Project::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->paragraph(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(['planned', 'active', 'completed']),
        ];
    }
}
