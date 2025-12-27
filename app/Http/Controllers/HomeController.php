<?php

namespace App\Http\Controllers;

use App\Models\HeroSection;
use App\Models\Offer;
use App\Models\Destination;
use App\Models\Package;
use App\Models\Favorite;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        $userId = Auth::guard('web')->check() ? Auth::guard('web')->id() : null;

        // Fetch favorites for the authenticated user
        $favorites = $userId ? Favorite::where('user_id', $userId)->get() : collect([]);

        $heroSections = HeroSection::select(['id', 'title', 'subtitle', 'image'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($hero) {
                $hero->image = $hero->image ? Storage::url($hero->image) : null;
                return $hero;
            });

        $offers = Offer::select([
            'id',
            'title',
            'description',
            'price',
            'discount_price',
            'discount_type',
            'start_date',
            'end_date',
            'image',
            'category',
            'is_active',
            'destination_id',
        ])
            ->where('is_active', true)
            ->with(['destination' => function ($query) {
                $query->select('id', 'title', 'location');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($offer) use ($favorites) {
                $offer->image = $offer->image ? Storage::url($offer->image) : null;
                $offer->title = $offer->title ?? 'Unknown Offer';
                $offer->description = $offer->description ?? '';
                $offer->price = $offer->price ?? 0;
                $offer->discount_price = $offer->discount_price ?? null;
                $offer->discount_type = $offer->discount_type ?? '';
                $offer->category = $offer->category ?? '';
                $offer->start_date = $offer->start_date ? $offer->start_date->format('Y-m-d') : null;
                $offer->end_date = $offer->end_date ? $offer->end_date->format('Y-m-d') : null;
                $offer->destination_title = $offer->destination ? $offer->destination->title : 'Unknown Destination';
                $offer->destination_location = $offer->destination ? $offer->destination->location : 'Unknown Location';
                $favorite = $favorites->firstWhere('offer_id', $offer->id);
                $offer->is_favorite = !is_null($favorite);
                $offer->favorite_id = $favorite ? $favorite->id : null;
                return $offer;
            });

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
            ->map(function ($destination) use ($favorites) {
                $destination->image = $destination->image ? Storage::url($destination->image) : null;
                $destination->title = $destination->title ?? 'Unknown Destination';
                $destination->location = $destination->location ?? 'Unknown Location';
                $destination->description = $destination->description ?? '';
                $destination->price = $destination->price ?? 0;
                $destination->discount_price = $destination->discount_price ?? null;
                $destination->category = $destination->category ?? '';
                $destination->rating = $destination->rating ?? 0;
                $destination->is_featured = $destination->is_featured ?? false;
                $favorite = $favorites->firstWhere('destination_id', $destination->id);
                $destination->is_favorite = !is_null($favorite);
                $destination->favorite_id = $favorite ? $favorite->id : null;
                return $destination;
            });

        $packages = Package::select([
            'id',
            'title',
            'description',
            'price',
            'discount_price',
            'destination_id',
            'company_id',
            'image',
            'category',
            'is_active',
            'is_featured',
            'start_date',
            'end_date',
            'duration',
            'group_size',
        ])
            ->where('is_active', true)
            ->with(['destination' => function ($query) {
                $query->select('id', 'title', 'location');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($package) use ($favorites) {
                $package->image = $package->image ? Storage::url($package->image) : null;
                $package->title = $package->title ?? 'Unknown Package';
                $package->description = $package->description ?? '';
                $package->price = $package->price ?? 0;
                $package->discount_price = $package->discount_price ?? null;
                $package->category = $package->category ?? '';
                $package->destination_title = $package->destination ? $package->destination->title : 'Unknown Destination';
                $package->destination_location = $package->destination ? $package->destination->location : 'Unknown Location';
                $favorite = $favorites->firstWhere('package_id', $package->id);
                $package->is_favorite = !is_null($favorite);
                $package->favorite_id = $favorite ? $favorite->id : null;
                return $package;
            });

        $translations = [
            'journey_planner_title' => __('Discover Your Next Adventure'),
            'journey_planner_subtitle' => __('Search for your favorite destinations or browse new offers and packages'),
            'offers_section_title' => __('Featured Offers'),
            'offers_empty_message' => __('No offers available at the moment.'),
            'destinations_section_title' => __('Trending Destinations'),
            'destinations_subtitle' => __('Discover our most popular vacation spots loved by travelers worldwide'),
            'destinations_empty_title' => __('No destinations available at the moment.'),
            'destinations_empty_subtitle' => __('Please check back later for new exciting locations.'),
            'benefits_section_title' => __('Why Choose Triplus'),
            'benefits' => [
                [
                    'title' => __('Best Price Guarantee'),
                    'description' => __('We guarantee the best prices compared to anywhere else.')
                ],
                [
                    'title' => __('Secure Booking'),
                    'description' => __('Your personal information and payments are always protected.')
                ],
                [
                    'title' => __('High-Quality Service'),
                    'description' => __('Our support team is available 24/7 to assist you.')
                ],
                [
                    'title' => __('Loyalty Rewards'),
                    'description' => __('Earn points with every booking and enjoy exclusive benefits.')
                ]
            ],
            'search_placeholder' => __('Search for destinations, offers, or packages...'),
            'surprise_me' => __('Surprise Me'),
            'view_all' => __('View All'),
            'details' => __('Details'),
            'starting_from' => __('Starting from'),
            'per_night' => __('/ night'),
            'explore_all_destinations' => __('Explore All Destinations'),
            'over_200_destinations' => __('Over 200+ exotic locations to discover around the world')
        ];

        return Inertia::render('Home', [
            'heroSections' => $heroSections,
            'offers' => $offers,
            'destinations' => $destinations,
            'packages' => $packages,
            'translations' => $translations,
            'favorites' => $favorites->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'favoritable_type' => $favorite->offer_id ? 'offer' : ($favorite->destination_id ? 'destination' : 'package'),
                    'favoritable_id' => $favorite->offer_id ?? $favorite->destination_id ?? $favorite->package_id,
                ];
            }),
        ]);
    }
}
