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
            $table->foreignId('user_id')->nullable()->after('go_seo_site_id')->constrained()->onDelete('cascade');
        });

        DB::statement('
            UPDATE seo_sites 
            SET user_id = (
                SELECT user_id 
                FROM seo_site_users 
                WHERE seo_site_users.go_seo_site_id = seo_sites.go_seo_site_id 
                LIMIT 1
            )
        ');

        Schema::table('seo_sites', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });

        Schema::dropIfExists('seo_site_users');
    }

    public function down(): void
    {
        Schema::create('seo_site_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('go_seo_site_id');
            $table->timestamps();
            
            $table->unique(['user_id', 'go_seo_site_id']);
            $table->index('go_seo_site_id');
        });

        DB::statement('
            INSERT INTO seo_site_users (user_id, go_seo_site_id, created_at, updated_at)
            SELECT user_id, go_seo_site_id, NOW(), NOW()
            FROM seo_sites
        ');

        Schema::table('seo_sites', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};