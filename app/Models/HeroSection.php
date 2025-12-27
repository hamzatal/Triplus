<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    protected $fillable = ['title', 'subtitle', 'image', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
