<?php

namespace Database\Seeders;

use App\Enums\TaskStatusType;
use App\Models\Project;
use App\Models\TaskStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $defaultStatuses = TaskStatusType::getDefaultStatuses();

            foreach ($defaultStatuses as $status) {
                TaskStatus::create([
                    'project_id' => $project->id,
                    'name' => $status['name'],
                    'order' => $status['order'],
                    'color' => $status['color'],
                ]);
            }
        }
    }
}
