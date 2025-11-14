<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geo', function (Blueprint $table) {
            $table->bigInteger('criteria_id')->primary();
            $table->string('name');
            $table->string('canonical_name');
            $table->bigInteger('parent_id')->nullable();
            $table->string('country_code', 2);
            $table->string('target_type');
            $table->string('status');
            $table->timestamps();
            
            $table->index('country_code');
            $table->index('target_type');
            $table->index('parent_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geo');
    }
};

