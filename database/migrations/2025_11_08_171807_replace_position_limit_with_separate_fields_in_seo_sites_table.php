<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->integer('position_limit_yandex')->nullable()->default(10)->after('position_limit');
            $table->integer('position_limit_google')->nullable()->default(10)->after('position_limit_yandex');
        });

        DB::table('seo_sites')->whereNotNull('position_limit')->update([
            'position_limit_yandex' => DB::raw('position_limit'),
            'position_limit_google' => DB::raw('position_limit'),
        ]);

        Schema::table('seo_sites', function (Blueprint $table) {
            $table->dropColumn('position_limit');
        });
    }

    public function down(): void
    {
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->integer('position_limit')->nullable()->default(10)->after('device_settings');
        });

        DB::table('seo_sites')->whereNotNull('position_limit_yandex')->update([
            'position_limit' => DB::raw('position_limit_yandex'),
        ]);


        Schema::table('seo_sites', function (Blueprint $table) {
            $table->dropColumn(['position_limit_yandex', 'position_limit_google']);
        });
    }
};
