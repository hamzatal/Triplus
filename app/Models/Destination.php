<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'location',
        'category',
        'price',
        'discount_price',
        'image',
        'rating',
        'is_featured',
        'is_active', 
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'rating' => 'float',
        'is_featured' => 'boolean',
        'is_active' => 'boolean', 
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bookings()
    {
        return $this->hasMany(Checkout::class, 'destination_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'destination_id');
    }

    public function packages()
    {
        return $this->hasMany(Package::class, 'destination_id');
    }

    public function offers()
    {
        return $this->hasMany(Offer::class, 'destination_id');
    }
}
