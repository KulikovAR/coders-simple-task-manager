<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seo_site_targets', function (Blueprint $table) {
            if (Schema::hasColumn('seo_site_targets', 'domain_criteria_id')) {
                $table->dropColumn('domain_criteria_id');
            }
            if (Schema::hasColumn('seo_site_targets', 'region_criteria_id')) {
                $table->dropColumn('region_criteria_id');
            }
            if (Schema::hasColumn('seo_site_targets', 'country_code')) {
                $table->dropColumn('country_code');
            }
            $table->string('domain')->nullable()->after('search_engine');
            $table->string('region')->nullable()->after('domain');
            $table->index('domain');
            $table->index('region');
        });
    }

    public function down(): void
    {
        Schema::table('seo_site_targets', function (Blueprint $table) {
            $table->unsignedBigInteger('domain_criteria_id')->nullable();
            $table->unsignedBigInteger('region_criteria_id')->nullable();
            $table->string('country_code', 2)->nullable();
            $table->dropIndex(['domain']);
            $table->dropIndex(['region']);
            $table->dropColumn(['domain', 'region']);
        });
    }
};
