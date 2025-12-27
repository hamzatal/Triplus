<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'destination_id',
        'title',
        'subtitle',
        'description',
        'location',
        'category',
        'price',
        'discount_price',
        'discount_type',
        'image',
        'is_featured',
        'is_active',
        'start_date',
        'end_date',
        'duration',
        'group_size',
    ];
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
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
        return $this->hasMany(Checkout::class, 'package_id');
    }
}
