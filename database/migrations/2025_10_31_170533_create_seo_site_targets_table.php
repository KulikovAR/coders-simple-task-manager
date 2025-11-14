<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_site_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seo_site_id')->constrained('seo_sites')->onDelete('cascade');
            $table->string('search_engine');
            $table->unsignedBigInteger('domain_criteria_id');
            $table->unsignedBigInteger('region_criteria_id')->nullable();
            $table->string('country_code', 2);
            $table->string('language')->nullable();
            $table->integer('lr')->nullable();
            $table->string('device');
            $table->string('os')->nullable();
            $table->timestamps();

            $table->index(['seo_site_id', 'search_engine']);
            $table->index('domain_criteria_id');
            $table->index('region_criteria_id');
            $table->index('country_code');
            $table->index('language');
            $table->index('lr');
            $table->index('device');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_site_targets');
    }
};
