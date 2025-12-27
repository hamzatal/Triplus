<?php

namespace App\Http\Controllers;

use App\Models\CheckOut;
use App\Models\Favorite;
use App\Models\Review;
use App\Models\Destination;
use App\Models\Package;
use App\Models\Offer;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class UserBookingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to view your bookings and favorites.');
        }

        $bookings = CheckOut::where('user_id', $user->id)
            ->with([
                'destination' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'location',
                        'description',
                        'image',
                        'price',
                        'discount_price',
                        'category',
                        'rating',
                    ]);
                },
                'offer' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'description',
                        'location',
                        'price',
                        'discount_price',
                        'discount_type',
                        'image',
                        'category',
                        'rating',
                        'end_date',
                    ]);
                },
                'package' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'description',
                        'price',
                        'discount_price',
                        'image',
                        'category',
                        'rating',
                    ]);
                },
                'reviews' => function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->select(['id', 'user_id', 'reviewable_type', 'reviewable_id', 'rating', 'comment', 'booking_id']);
                },
            ])
            ->select([
                'id',
                'user_id',
                'company_id',
                'destination_id',
                'offer_id',
                'package_id',
                'check_in',
                'check_out',
                'guests',
                'total_price',
                'status',
                'notes',
                'payment_method',
                'confirmation_code',
                'created_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                if ($booking->destination) {
                    $booking->destination->image = $booking->destination->image
                        ? Storage::url($booking->destination->image)
                        : null;
                }
                if ($booking->offer) {
                    $booking->offer->image = $booking->offer->image
                        ? Storage::url($booking->offer->image)
                        : null;
                }
                if ($booking->package) {
                    $booking->package->image = $booking->package->image
                        ? Storage::url($booking->package->image)
                        : null;
                }
                return $booking;
            });

        $favorites = Favorite::where('user_id', $user->id)
            ->with([
                'destination' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'location',
                        'description',
                        'image',
                        'price',
                        'discount_price',
                        'category',
                        'rating',
                    ]);
                },
                'package' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'description',
                        'price',
                        'discount_price',
                        'image',
                        'category',
                        'rating',
                    ]);
                },
                'offer' => function ($query) {
                    $query->select([
                        'id',
                        'title',
                        'description',
                        'location',
                        'price',
                        'discount_price',
                        'discount_type',
                        'image',
                        'category',
                        'rating',
                        'end_date',
                    ])->where('is_active', true);
                },
                'company' => function ($query) {
                    $query->select(['id', 'name']);
                },
            ])
            ->select(['id', 'user_id', 'destination_id', 'package_id', 'offer_id', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($favorite) {
                if ($favorite->destination) {
                    $favorite->favoritable_type = 'destination';
                    $favorite->favoritable_id = $favorite->destination_id;
                    $favorite->destination->image = $favorite->destination->image
                        ? Storage::url($favorite->destination->image)
                        : null;
                } elseif ($favorite->package) {
                    $favorite->favoritable_type = 'package';
                    $favorite->favoritable_id = $favorite->package_id;
                    $favorite->package->image = $favorite->package->image
                        ? Storage::url($favorite->package->image)
                        : null;
                } elseif ($favorite->offer) {
                    $favorite->favoritable_type = 'offer';
                    $favorite->favoritable_id = $favorite->offer_id;
                    $favorite->offer->image = $favorite->offer->image
                        ? Storage::url($favorite->offer->image)
                        : null;
                }
                return $favorite;
            });

        return Inertia::render('UserBookings', [
            'bookings' => $bookings,
            'favorites' => $favorites,
        ]);
    }

    public function submitRating(Request $request, $bookingId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $booking = CheckOut::where('id', $bookingId)
            ->where('user_id', $user->id)
            ->with(['destination', 'package', 'offer'])
            ->firstOrFail();

        if ($booking->status !== 'completed') {
            return response()->json(['error' => 'Only completed bookings can be rated.'], 403);
        }

        if (!$booking->check_out || now()->lte($booking->check_out)) {
            return response()->json(['error' => 'Rating is only available after the trip ends.'], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $entity = $booking->destination ?? $booking->package ?? $booking->offer;
        if (!$entity) {
            return response()->json(['error' => 'No reviewable entity found for this booking.'], 400);
        }

        $reviewableType = $booking->destination ? 'destination' : ($booking->package ? 'package' : 'offer');
        $reviewableId = $entity->id;

        $existingReview = Review::where('user_id', $user->id)
            ->where('booking_id', $bookingId)
            ->first();

        if ($existingReview) {
            return response()->json(['error' => 'You have already rated this booking.'], 409);
        }

        DB::beginTransaction();

        $review = Review::create([
            'user_id' => $user->id,
            'reviewable_type' => $reviewableType,
            'reviewable_id' => $reviewableId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'booking_id' => $booking->id,
        ]);

        $averageRating = Review::where('reviewable_type', $reviewableType)
            ->where('reviewable_id', $reviewableId)
            ->avg('rating');

        $modelClass = match ($reviewableType) {
            'destination' => Destination::class,
            'package' => Package::class,
            'offer' => Offer::class,
            default => null,
        };

        if ($modelClass) {
            $modelClass::where('id', $reviewableId)->update(['rating' => round($averageRating, 1)]);
        }

        DB::commit();

        return response()->json(['success' => 'Rating submitted successfully!']);
    }
}
