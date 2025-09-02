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

        $projects = Project::whereNull('slug')->orWhere('slug', '')->get();
        foreach ($projects as $project) {
            $project->slug = SlugHelper::generateUniqueSlug($project->name, Project::class, $project->id);
            $project->save();
        }

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
