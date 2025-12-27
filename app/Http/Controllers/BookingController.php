<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Package;
use App\Models\Offer;
use App\Models\CheckOut;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        $destinations = Destination::select([
            'id',
            'title',
            'location',
            'description',
            'image',
            'price',
            'discount_price',
            'category',
            'rating',
            'is_featured',
        ])
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($destination) use ($userId) {
                $destination->image = $destination->image ? Storage::url($destination->image) : null;
                $destination->title = $destination->title ?? 'Unknown Destination';
                $destination->location = $destination->location ?? 'Unknown Location';
                $destination->description = $destination->description ?? '';
                $destination->price = $destination->price ?? 0;
                $destination->discount_price = $destination->discount_price ?? null;
                $destination->category = $destination->category ?? '';
                $destination->rating = $destination->rating ?? 0;
                $destination->is_featured = $destination->is_featured ?? false;
                $destination->is_favorite = $userId
                    ? Favorite::where('user_id', $userId)->where('destination_id', $destination->id)->exists()
                    : false;
                return $destination;
            });

        $packages = Package::select([
            'id',
            'title',
            'subtitle',
            'description',
            'price',
            'discount_price',
            'image',
            'rating',
            'is_featured',
            'destination_id',
            'discount_type',
            'category',
            'start_date',
            'end_date',
            'location',
            'duration',
            'group_size',
        ])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['destination' => function ($query) {
                $query->select('id', 'title', 'location');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($package) use ($userId) {
                $package->image = $package->image ? Storage::url($package->image) : null;
                $package->title = $package->title ?? 'Unknown Package';
                $package->subtitle = $package->subtitle ?? '';
                $package->description = $package->description ?? '';
                $package->price = $package->price ?? 0;
                $package->discount_price = $package->discount_price ?? null;
                $package->rating = $package->rating ?? 0;
                $package->discount_type = $package->discount_type ?? '';
                $package->category = $package->category ?? '';
                $package->start_date = $package->start_date ? $package->start_date->format('Y-m-d') : null;
                $package->end_date = $package->end_date ? $package->end_date->format('Y-m-d') : null;
                $package->location = $package->location ?? ($package->destination ? $package->destination->location : 'Unknown Location');
                $package->duration = $package->duration ?? '';
                $package->group_size = $package->group_size ?? '';
                $package->destination_title = $package->destination ? $package->destination->title : null;
                $package->is_favorite = $userId
                    ? Favorite::where('user_id', $userId)->where('package_id', $package->id)->exists()
                    : false;
                return $package;
            });

        $offers = Offer::select([
            'id',
            'title',
            'description',
            'price',
            'discount_price',
            'image',
            'start_date',
            'end_date',
            'discount_type',
            'category',
            'is_active',
        ])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($offer) use ($userId) {
                $offer->image = $offer->image ? Storage::url($offer->image) : null;
                $offer->title = $offer->title ?? 'Unknown Offer';
                $offer->description = $offer->description ?? '';
                $offer->price = $offer->price ?? 0;
                $offer->discount_price = $offer->discount_price ?? null;
                $offer->start_date = $offer->start_date ? $offer->start_date->format('Y-m-d') : null;
                $offer->end_date = $offer->end_date ? $offer->end_date->format('Y-m-d') : null;
                $offer->discount_type = $offer->discount_type ?? '';
                $offer->category = $offer->category ?? '';
                $offer->is_favorite = $userId
                    ? Favorite::where('user_id', $userId)->where('offer_id', $offer->id)->exists()
                    : false;
                return $offer;
            });

        $translations = [
            'book_now_title' => __('Book Your Next Adventure'),
            'destinations_section_title' => __('Featured Destinations'),
            'packages_section_title' => __('Featured Packages'),
            'offers_section_title' => __('Special Offers'),
            'no_items_message' => __('No items available at the moment.'),
            'starting_from' => __('Starting from'),
            'per_night' => __('/ night'),
            'details' => __('Details'),
            'book_now' => __('Book Now'),
            'search_placeholder' => __('Search for destinations, packages, or offers...')
        ];

        return Inertia::render('Book/BookNow', [
            'destinations' => $destinations,
            'packages' => $packages,
            'offers' => $offers,
            'translations' => $translations,
        ]);
    }

    public function favorite(Request $request, $type, $id)
    {
        if (!Auth::check()) {
            return Inertia::render('Book/BookNow', [
                'error' => 'Please log in to add to favorites',
            ]);
        }

        $user = Auth::user();
        $field = match ($type) {
            'destination' => 'destination_id',
            'package' => 'package_id',
            'offer' => 'offer_id',
            default => null,
        };

        if (!$field) {
            return Inertia::render('Book/BookNow', [
                'error' => 'Invalid item type',
            ]);
        }

        $exists = Favorite::where('user_id', $user->id)
            ->where($field, $id)
            ->exists();

        if ($exists) {
            Favorite::where('user_id', $user->id)
                ->where($field, $id)
                ->delete();
            $message = 'Removed from favorites';
            $isFavorite = false;
        } else {
            Favorite::create([
                'user_id' => $user->id,
                $field => $id,
            ]);
            $message = 'Added to favorites';
            $isFavorite = true;
        }

        return Inertia::render('Book/BookNow', [
            'success' => $message,
            'isFavorite' => $isFavorite,
            'itemType' => $type,
            'itemId' => $id,
        ]);
    }

    public function create(Request $request)
    {
        $destinationId = $request->query('destination_id');
        $packageId = $request->query('package_id');
        $offerId = $request->query('offer_id');

        $data = [
            'auth' => Auth::user() ? [
                'user' => Auth::user(),
            ] : null,
        ];

        if ($destinationId) {
            $destination = Destination::findOrFail($destinationId);
            $data['destination'] = [
                'id' => $destination->id,
                'title' => $destination->title,
                'location' => $destination->location,
                'price' => $destination->price,
                'discount_price' => $destination->discount_price,
                'image' => $destination->image ? Storage::url($destination->image) : null,
                'description' => $destination->description,
                'category' => $destination->category,
                'rating' => $destination->rating,
            ];
        }

        if ($packageId) {
            $package = Package::findOrFail($packageId);
            $data['package'] = [
                'id' => $package->id,
                'title' => $package->title,
                'location' => $package->location,
                'price' => $package->price,
                'discount_price' => $package->discount_price,
                'image' => $package->image ? Storage::url($package->image) : null,
                'description' => $package->description,
                'category' => $package->category,
                'rating' => $package->rating,
                'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
            ];
        }

        if ($offerId) {
            $offer = Offer::findOrFail($offerId);
            $data['offer'] = [
                'id' => $offer->id,
                'title' => $offer->title,
                'location' => $offer->location,
                'price' => $offer->price,
                'discount_price' => $offer->discount_price,
                'image' => $offer->image ? Storage::url($offer->image) : null,
                'description' => $offer->description,
                'category' => $offer->category,
                'start_date' => $offer->start_date ? $offer->start_date->format('Y-m-d') : null,
                'end_date' => $offer->end_date ? $offer->end_date->format('Y-m-d') : null,
            ];
        }

        if (!$destinationId && !$packageId && !$offerId) {
            return Inertia::render('Error', [
                'message' => 'No destination, package, or offer specified.',
            ]);
        }

        return Inertia::render('Book/CheckOut', $data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination_id' => 'nullable|exists:destinations,id',
            'package_id' => 'nullable|exists:packages,id',
            'offer_id' => 'nullable|exists:offers,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'required|integer|min:1|max:8',
            'notes' => 'nullable|string|max:500',
        ]);

        if (!$validated['destination_id'] && !$validated['package_id'] && !$validated['offer_id']) {
            return Redirect::back()->withErrors(['error' => 'A destination, package, or offer must be specified.']);
        }

        $companyId = null;
        $pricePerGuest = 0;

        if ($validated['destination_id']) {
            $destination = Destination::find($validated['destination_id']);
            $companyId = $destination->company_id;
            $pricePerGuest = $destination->discount_price ?? $destination->price;
        } elseif ($validated['package_id']) {
            $package = Package::find($validated['package_id']);
            $companyId = $package->company_id;
            $pricePerGuest = $package->discount_price ?? $package->price;
        } elseif ($validated['offer_id']) {
            $offer = Offer::find($validated['offer_id']);
            $companyId = $offer->company_id;
            $pricePerGuest = $offer->discount_price ?? $offer->price;
        }

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $days = $checkIn->diffInDays($checkOut);

        $totalPrice = $pricePerGuest * $validated['guests'] * ($days > 0 ? $days : 1);

        $checkout = CheckOut::create([
            'user_id' => Auth::id(),
            'company_id' => $companyId,
            'destination_id' => $validated['destination_id'],
            'package_id' => $validated['package_id'],
            'offer_id' => $validated['offer_id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guests' => $validated['guests'],
            'notes' => $validated['notes'],
            'total_price' => $totalPrice,
            'status' => 'pending',
            'payment_method' => 'cash',
        ]);

        return Redirect::route('bookings.index')
            ->with('success', "Booking confirmed! Your confirmation code is: {$checkout->confirmation_code}");
    }
    public function show($id)
{
    $booking = CheckOut::where('user_id', Auth::id())
        ->where('id', $id)
        ->with([
            'destination' => fn ($query) => $query->select([
                'id', 'title', 'location', 'description', 'image', 'price', 'discount_price', 'category', 'rating',
            ]),
            'package' => fn ($query) => $query->select([
                'id', 'title', 'description', 'price', 'discount_price', 'image', 'category',
            ]),
            'offer' => fn ($query) => $query->select([
                'id', 'title', 'description', 'location', 'price', 'discount_price', 'discount_type', 'image', 'category', 'rating', 'end_date',
            ]),
        ])
        ->select([
            'id', 'user_id', 'destination_id', 'package_id', 'offer_id', 'check_in', 'check_out', 'guests',
            'total_price', 'status', 'notes', 'payment_method', 'confirmation_code', 'created_at',
        ])
        ->firstOrFail();

    if ($booking->destination && $booking->destination->image) {
        $booking->destination->image = Storage::url($booking->destination->image);
    }
    if ($booking->package && $booking->package->image) {
        $booking->package->image = Storage::url($booking->package->image);
    }
    if ($booking->offer && $booking->offer->image) {
        $booking->offer->image = Storage::url($booking->offer->image);
    }

    return Inertia::render('Book/BookingShow', [
        'booking' => $booking,
    ]);
}
    public function cancel(CheckOut $booking)
    {
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return Redirect::route('bookings.index')
                ->with('error', 'Booking cannot be cancelled.');
        }

        $createdAt = Carbon::parse($booking->created_at);
        if ($createdAt->diffInHours(now()) > 12) {
            return Redirect::route('bookings.index')
                ->with('error', 'Cancellation period has expired.');
        }

        $booking->update(['status' => 'cancelled']);

        return Redirect::route('bookings.index')
            ->with('success', 'Booking cancelled successfully');
    }
}
