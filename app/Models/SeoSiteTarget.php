<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSiteTarget extends Model
{
    protected $fillable = [
        'seo_site_id',
        'search_engine',
        'domain',
        'region',
        'language',
        'lr',
        'device',
        'os',
        'organic',
        'enabled',
    ];

    public function site()
    {
        return $this->belongsTo(SeoSite::class, 'seo_site_id');
    }
}
