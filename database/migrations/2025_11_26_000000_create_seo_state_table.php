<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_state', function (Blueprint $table) {
            $table->id();
            $table->boolean('xml_stock_highload')->default(false);
            $table->boolean('xml_river_highload')->default(false);
            $table->timestamps();
        });

        // Создаем запись с id = 1
        DB::table('seo_state')->insert([
            'id' => 1,
            'xml_stock_highload' => false,
            'xml_river_highload' => false,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_state');
    }
};