<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'status',
        'payment_id',
        'expires_at',
        'data',
    ];
}
