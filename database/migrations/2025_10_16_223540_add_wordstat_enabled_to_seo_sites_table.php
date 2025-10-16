<?php

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
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->boolean('wordstat_enabled')->default(false)->after('schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->dropColumn('wordstat_enabled');
        });
    }
};
