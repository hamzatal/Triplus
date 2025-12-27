<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Company extends Authenticatable
{
    use Notifiable;

    protected $guard = 'company';

    protected $fillable = [
        'name',
        'company_name',
        'license_number',
        'email',
        'password',
        'company_logo',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function destinations()
    {
        return $this->hasMany(Destination::class);
    }

    public function packages()
    {
        return $this->hasMany(Package::class);
    }

    public function offers()
    {
        return $this->hasMany(Offer::class);
    }

    public function bookings()
    {
        return $this->hasMany(Checkout::class);
    }
}
