<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'user_id',
        'destination_id',
        'check_in',
        'check_out',
        'guests',
        'notes',
        'total_price',
        'status',
    ];
}
