<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoSite extends Model
{
    use HasFactory;

    protected $fillable = [
        'go_seo_site_id',
        'user_id',
        'name',
        'search_engines',
        'regions',
        'device_settings',
        'position_limit',
        'subdomains',
        'schedule',
        'wordstat_enabled',
        'wordstat_region',
    ];

    protected $casts = [
        'search_engines' => 'array',
        'regions' => 'array',
        'device_settings' => 'array',
        'schedule' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
