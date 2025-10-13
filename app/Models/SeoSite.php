<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoSite extends Model
{
    use HasFactory;

    protected $fillable = [
        'go_seo_site_id',
        'name',
        'search_engines',
        'regions',
        'device_settings',
    ];

    protected $casts = [
        'search_engines' => 'array',
        'regions' => 'array',
        'device_settings' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'seo_site_users', 'go_seo_site_id', 'user_id');
    }
}
