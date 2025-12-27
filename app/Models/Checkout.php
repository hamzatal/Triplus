<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class CheckOut extends Model
{
    use HasFactory;

    protected $table = 'checkout';

    protected $fillable = [
        'user_id',

        'company_id',
        'destination_id',
        'package_id',
        'offer_id',
        'check_in',
        'check_out',
        'guests',
        'total_price',
        'status',
        'notes',
        'payment_method',
        'confirmation_code',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'check_in' => 'date',
        'check_out' => 'date',
        'guests' => 'integer',
        'status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
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
    public function reviews()
    {
        return $this->hasMany(Review::class, 'booking_id');
    }
    public static function boot()
    {
        parent::boot();

        static::creating(function ($checkout) {
            $checkout->confirmation_code = Str::random(12);
            $checkout->payment_method = 'cash';

            $validator = Validator::make($checkout->toArray(), [
                'destination_id' => 'nullable|exists:destinations,id',
                'package_id' => 'nullable|exists:packages,id',
                'offer_id' => 'nullable|exists:offers,id',
                'payment_method' => 'required|in:cash',
            ], [
                'at_least_one' => 'At least one of destination_id, package_id, or offer_id must be provided.',
                'payment_method.in' => 'Only cash payment is supported.',
            ]);

            $validator->after(function ($validator) use ($checkout) {
                if (!$checkout->destination_id && !$checkout->package_id && !$checkout->offer_id) {
                    $validator->errors()->add('at_least_one', 'At least one of destination_id, package_id, or offer_id must be provided.');
                }
            });

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        });

        static::updating(function ($checkout) {
            $validator = Validator::make($checkout->toArray(), [
                'destination_id' => 'nullable|exists:destinations,id',
                'package_id' => 'nullable|exists:packages,id',
                'offer_id' => 'nullable|exists:offers,id',
                'payment_method' => 'required|in:cash',
            ], [
                'at_least_one' => 'At least one of destination_id, package_id, or offer_id must be provided.',
                'payment_method.in' => 'Only cash payment is supported.',
            ]);

            $validator->after(function ($validator) use ($checkout) {
                if (!$checkout->destination_id && !$checkout->package_id && !$checkout->offer_id) {
                    $validator->errors()->add('at_least_one', 'At least one of destination_id, package_id, or offer_id must be provided.');
                }
            });

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        });
    }
}
