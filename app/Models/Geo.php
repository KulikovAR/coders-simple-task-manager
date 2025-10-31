<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Geo extends Model
{
    protected $table = 'geo';
    
    public $incrementing = false;
    
    protected $primaryKey = 'criteria_id';
    
    protected $fillable = [
        'criteria_id',
        'name',
        'canonical_name',
        'parent_id',
        'country_code',
        'target_type',
        'status',
    ];
    
    public $timestamps = false;
    
    public function parent()
    {
        return $this->belongsTo(Geo::class, 'parent_id', 'criteria_id');
    }
    
    public function children()
    {
        return $this->hasMany(Geo::class, 'parent_id', 'criteria_id');
    }
}

