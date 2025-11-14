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
        Schema::create('seo_sites', function (Blueprint $table) {
            $table->id();
            $table->integer('go_seo_site_id')->unique(); // ID сайта в микросервисе
            $table->json('search_engines')->nullable(); // ['google', 'yandex']
            $table->json('regions')->nullable(); // {'google': 'ru', 'yandex': 'en'}
            $table->timestamps();
            
            $table->index('go_seo_site_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seo_sites');
    }
};