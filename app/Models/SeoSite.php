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
        'public_token',
        'search_engines',
        'regions',
        'device_settings',
        'position_limit_yandex',
        'position_limit_google',
        'subdomains',
        'schedule',
        'wordstat_enabled',
        'wordstat_region',
        'wordstat_options',
    ];

    protected $casts = [
        'search_engines' => 'array',
        'regions' => 'array',
        'device_settings' => 'array',
        'schedule' => 'array',
        'wordstat_options' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
