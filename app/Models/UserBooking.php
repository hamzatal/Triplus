<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBooking extends Model
{
    protected $table = 'books';
    protected $fillable = [
        'user_id',
        'destination_id',
        'package_id',
        'offer_id',
        'check_in',
        'check_out',
        'guests',
        'notes',
        'total_price',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
