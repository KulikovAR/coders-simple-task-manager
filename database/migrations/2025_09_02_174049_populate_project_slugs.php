<?php

use App\Helpers\SlugHelper;
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
        // Проверяем, существует ли поле slug
        if (!Schema::hasColumn('projects', 'slug')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name');
            });
        }

        // Заполняем slug для всех проектов
        $projects = Project::all();
        foreach ($projects as $project) {
            if (empty($project->slug)) {
                $project->slug = SlugHelper::generateUniqueSlug($project->name, Project::class, $project->id);
                $project->save();
            }
        }

        // Добавляем уникальное ограничение
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['slug']);
        });
    }
};
