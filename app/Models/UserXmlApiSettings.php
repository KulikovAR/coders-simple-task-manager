<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserXmlApiSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'xml_api_key',
        'xml_base_url',
        'xml_user_id',
        'xml_wordstat_api_key',
        'xml_wordstat_base_url',
        'xml_wordstat_user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}