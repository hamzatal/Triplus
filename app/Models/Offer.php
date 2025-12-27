<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $fillable = [
        'company_id',
        'destination_id',
        'title',
        'description',
        'location',
        'category',
        'price',
        'discount_price',
        'discount_type',
        'image',
        'rating',
        'is_active',
        'start_date',
        'end_date',
        'duration',
        'group_size',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'rating' => 'float',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function bookings()
    {
        return $this->hasMany(Checkout::class, 'offer_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'offer_id');
    }
}
