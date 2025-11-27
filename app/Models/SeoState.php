<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoState extends Model
{
    protected $table = 'seo_state';

    protected $fillable = [
        'xml_stock_highload',
        'xml_river_highload',
    ];

    protected $casts = [
        'xml_stock_highload' => 'boolean',
        'xml_river_highload' => 'boolean',
    ];

    public $timestamps = true;
}