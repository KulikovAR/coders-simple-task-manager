<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('seo_sites') || !Schema::hasTable('seo_site_targets')) {
            return;
        }

        $sites = DB::table('seo_sites')->select('id', 'search_engines', 'regions', 'device_settings', 'wordstat_region')->get();

        foreach ($sites as $site) {
            $engines = $site->search_engines ? json_decode($site->search_engines, true) : [];
            $regions = $site->regions ? json_decode($site->regions, true) : [];
            $devices = $site->device_settings ? json_decode($site->device_settings, true) : [];

            if (!is_array($engines)) $engines = [];
            if (!is_array($regions)) $regions = [];
            if (!is_array($devices)) $devices = [];

            foreach ($engines as $engine) {
                $engine = is_array($engine) ? null : (string)$engine;
                if (empty($engine)) {
                    continue;
                }

                $regionValue = $regions[$engine] ?? null;
                $regionString = null;
                if (is_scalar($regionValue)) {
                    $regionString = (string)$regionValue;
                } elseif (is_array($regionValue)) {
                    $regionString = $regionValue['region'] ?? ($regionValue['code'] ?? null);
                    if (is_array($regionString)) {
                        $regionString = null;
                    }
                    if (!is_null($regionString)) {
                        $regionString = (string)$regionString;
                    }
                }

                $deviceList = ['desktop'];
                $osList = [];
                if (isset($devices[$engine]) && is_array($devices[$engine])) {
                    $deviceList = $devices[$engine]['devices'] ?? ['desktop'];
                    $osList = $devices[$engine]['os'] ?? [];
                    if (!is_array($deviceList)) $deviceList = ['desktop'];
                    if (!is_array($osList)) $osList = [];
                }

                foreach ($deviceList as $device) {
                    $device = is_scalar($device) ? (string)$device : 'desktop';
                    $effectiveOsList = $device === 'mobile' ? $osList : [];
                    if (empty($effectiveOsList)) {
                        $effectiveOsList = [null];
                    }

                    foreach ($effectiveOsList as $os) {
                        $osVal = is_scalar($os) ? (string)$os : null;
                        DB::table('seo_site_targets')->insert([
                            'seo_site_id' => $site->id,
                            'search_engine' => $engine,
                            'domain' => null,
                            'region' => $regionString,
                            'language' => null,
                            'lr' => $engine === 'yandex' ? (is_null($site->wordstat_region) ? null : (int)$site->wordstat_region) : null,
                            'device' => $device,
                            'os' => $osVal,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('seo_site_targets')) {
            DB::table('seo_site_targets')->truncate();
        }
    }
};
