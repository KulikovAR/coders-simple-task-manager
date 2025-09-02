<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('internal_id')->nullable()->after('project_id');
        });

        $projects = Project::with('tasks')->get();
        foreach ($projects as $project) {
            $internalId = 1;
            foreach ($project->tasks as $task) {
                $task->internal_id = $internalId;
                $task->save();
                $internalId++;
            }
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->unique(['project_id', 'internal_id'], 'tasks_project_internal_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropUnique('tasks_project_internal_unique');
            $table->dropColumn('internal_id');
        });
    }
};
