<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CheckOut extends Model
{
    use HasFactory;

    protected $table = 'CheckOut';

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

    /**
     * Validate that at least one of destination_id, package_id, or offer_id is present.
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($CheckOut) {
            $validator = Validator::make($CheckOut->toArray(), [
                'destination_id' => 'nullable|exists:destinations,id',
                'package_id' => 'nullable|exists:packages,id',
                'offer_id' => 'nullable|exists:offers,id',
            ], [
                'at_least_one' => 'At least one of destination_id, package_id, or offer_id must be provided.',
            ]);

            $validator->after(function ($validator) use ($CheckOut) {
                if (!$CheckOut->destination_id && !$CheckOut->package_id && !$CheckOut->offer_id) {
                    $validator->errors()->add('at_least_one', 'At least one of destination_id, package_id, or offer_id must be provided.');
                }
            });

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        });

        static::updating(function ($CheckOut) {
            $validator = Validator::make($CheckOut->toArray(), [
                'destination_id' => 'nullable|exists:destinations,id',
                'package_id' => 'nullable|exists:packages,id',
                'offer_id' => 'nullable|exists:offers,id',
            ], [
                'at_least_one' => 'At least one of destination_id, package_id, or offer_id must be provided.',
            ]);

            $validator->after(function ($validator) use ($CheckOut) {
                if (!$CheckOut->destination_id && !$CheckOut->package_id && !$CheckOut->offer_id) {
                    $validator->errors()->add('at_least_one', 'At least one of destination_id, package_id, or offer_id must be provided.');
                }
            });

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        });
    }
}
