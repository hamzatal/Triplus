<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'destination_id',
        'package_id',
        'offer_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
