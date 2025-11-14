<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_xml_api_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('xml_api_key')->nullable();
            $table->string('xml_base_url')->nullable();
            $table->string('xml_user_id')->nullable();
            $table->string('xml_wordstat_api_key')->nullable();
            $table->string('xml_wordstat_base_url')->nullable();
            $table->string('xml_wordstat_user_id')->nullable();
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_xml_api_settings');
    }
};