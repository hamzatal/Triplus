<?php

namespace App\Http\Controllers\CompanyAuth;

use App\Http\Controllers\Controller;
use App\Models\Checkout;
use App\Models\Destination;
use App\Models\Offer;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CompanyDashboardController extends Controller
{
    public function index()
    {
        try {
            $company = Auth::guard('company')->user();

            if (!$company) {
                return redirect()->route('company.login')->with('error', 'Please log in to access the dashboard.');
            }

            $stats = [
                'destinations' => Destination::where('company_id', $company->id)->count(),
                'offers' => Offer::where('company_id', $company->id)->count(),
                'packages' => Package::where('company_id', $company->id)->count(),
                'checkouts' => Checkout::where(function ($query) use ($company) {
                    $query->whereHas('destination', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('offer', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('package', fn($q) => $q->where('company_id', $company->id));
                })->count(),
                'total_revenue' => Checkout::where('status', 'confirmed')
                    ->where(function ($query) use ($company) {
                        $query->whereHas('destination', fn($q) => $q->where('company_id', $company->id))
                            ->orWhereHas('offer', fn($q) => $q->where('company_id', $company->id))
                            ->orWhereHas('package', fn($q) => $q->where('company_id', $company->id));
                    })
                    ->sum('total_price'),
            ];

            $destinations = Destination::where('company_id', $company->id)
                ->paginate(10)
                ->through(function ($destination) {
                    return [
                        'id' => $destination->id,
                        'name' => $destination->title ?? 'Untitled Destination',
                        'location' => $destination->location ?? 'Unknown',
                        'price' => (float) ($destination->price ?? 0),
                        'discount_price' => (float) ($destination->discount_price ?? 0),
                        'description' => $destination->description ?? 'No description available.',
                        'image' => $destination->image ? Storage::url($destination->image) : null,
                        'is_featured' => (bool) ($destination->is_featured ?? false),
                        'rating' => (float) ($destination->rating ?? 0),
                        'category' => $destination->category ?? 'Uncategorized',
                        'is_active' => (bool) ($destination->is_active ?? true),
                    ];
                });

            $offers = Offer::where('company_id', $company->id)
                ->with('destination')
                ->paginate(10)
                ->through(function ($offer) {
                    return [
                        'id' => $offer->id,
                        'title' => $offer->title ?? 'Untitled Offer',
                        'description' => $offer->description ?? 'No description available.',
                        'price' => (float) ($offer->price ?? 0),
                        'discount_price' => (float) ($offer->discount_price ?? 0),
                        'discount_type' => $offer->discount_type ?? 'percentage',
                        'start_date' => $offer->start_date ? $offer->start_date->format('Y-m-d') : null,
                        'end_date' => $offer->end_date ? $offer->end_date->format('Y-m-d') : null,
                        'image' => $offer->image ? Storage::url($offer->image) : null,
                        'is_active' => (bool) ($offer->is_active ?? true),
                        'location' => $offer->location ?? 'Unknown',
                        'category' => $offer->category ?? 'Uncategorized',
                        'rating' => (float) ($offer->rating ?? 0),
                        'destination_id' => $offer->destination_id,
                        'destination' => $offer->destination ? [
                            'id' => $offer->destination->id,
                            'name' => $offer->destination->title ?? 'Untitled Destination',
                        ] : null,
                    ];
                });

            $packages = Package::where('company_id', $company->id)
                ->with('destination')
                ->paginate(10)
                ->through(function ($package) {
                    return [
                        'id' => $package->id,
                        'title' => $package->title ?? 'Untitled Package',
                        'subtitle' => $package->subtitle ?? '',
                        'description' => $package->description ?? 'No description available.',
                        'price' => (float) ($package->price ?? 0),
                        'discount_price' => (float) ($package->discount_price ?? 0),
                        'discount_type' => $package->discount_type ?? 'percentage',
                        'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                        'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                        'image' => $package->image ? Storage::url($package->image) : null,
                        'is_featured' => (bool) ($package->is_featured ?? false),
                        'is_active' => (bool) ($package->is_active ?? true),
                        'location' => $package->location ?? 'Unknown',
                        'category' => $package->category ?? 'Uncategorized',
                        'rating' => (float) ($package->rating ?? 0),
                        'destination_id' => $package->destination_id,
                        'destination' => $package->destination ? [
                            'id' => $package->destination->id,
                            'name' => $package->destination->title ?? 'Untitled Destination',
                        ] : null,
                    ];
                });

            $checkouts = Checkout::where(function ($query) use ($company) {
                $query->whereHas('destination', fn($q) => $q->where('company_id', $company->id))
                    ->orWhereHas('offer', fn($q) => $q->where('company_id', $company->id))
                    ->orWhereHas('package', fn($q) => $q->where('company_id', $company->id));
            })
                ->with(['user', 'destination', 'offer', 'package'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->through(function ($checkout) {
                    return [
                        'id' => $checkout->id,
                        'user' => $checkout->user ? [
                            'id' => $checkout->user->id,
                            'name' => $checkout->user->name ?? 'Anonymous',
                            'phone' => $checkout->user->phone ?? 'N/A',
                            'email' => $checkout->user->email ?? 'N/A',
                        ] : [
                            'id' => null,
                            'name' => 'Anonymous',
                            'phone' => 'N/A',
                            'email' => 'N/A',
                        ],
                        'destination' => $checkout->destination ? [
                            'id' => $checkout->destination->id,
                            'name' => $checkout->destination->title ?? 'Untitled Destination',
                            'image' => $checkout->destination->image ? Storage::url($checkout->destination->image) : null,
                        ] : null,
                        'offer' => $checkout->offer ? [
                            'id' => $checkout->offer->id,
                            'title' => $checkout->offer->title ?? 'Untitled Offer',
                            'image' => $checkout->offer->image ? Storage::url($checkout->offer->image) : null,
                        ] : null,
                        'package' => $checkout->package ? [
                            'id' => $checkout->package->id,
                            'title' => $checkout->package->title ?? 'Untitled Package',
                            'image' => $checkout->package->image ? Storage::url($checkout->package->image) : null,
                        ] : null,
                        'status' => $checkout->status ?? 'pending',
                        'total_price' => (float) ($checkout->total_price ?? 0),
                        'check_in' => $checkout->check_in ? $checkout->check_in->format('Y-m-d') : null,
                        'check_out' => $checkout->check_out ? $checkout->check_out->format('Y-m-d') : null,
                        'guests' => $checkout->guests ?? 1,
                        'created_at' => $checkout->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return Inertia::render('Company/Dashboard', [
                'company' => [
                    'id' => $company->id,
                    'company_name' => $company->company_name ?? 'Unnamed Company',
                    'email' => $company->email ?? 'N/A',
                    'avatar' => $company->contact_avatar ? Storage::url($company->contact_avatar) : null,
                    'type' => 'company',
                ],
                'stats' => $stats,
                'destinations' => $destinations,
                'offers' => $offers,
                'packages' => $packages,
                'bookings' => $checkouts,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load company dashboard:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load dashboard data. Please try again.');
        }
    }

    public function cancelBooking(Request $request, $id)
    {
        try {
            $company = Auth::guard('company')->user();
            if (!$company) {
                return redirect()->route('company.login')->with('error', 'Unauthorized access.');
            }

            $booking = Checkout::where('id', $id)
                ->where(function ($query) use ($company) {
                    $query->whereHas('destination', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('offer', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('package', fn($q) => $q->where('company_id', $company->id));
                })
                ->first();

            if (!$booking) {
                return back()->with('error', 'Booking not found or unauthorized.');
            }

            if (!in_array($booking->status, ['pending', 'confirmed'])) {
                return back()->with('error', 'This booking cannot be cancelled.');
            }

            $booking->status = 'cancelled';
            $booking->save();

        } catch (\Exception $e) {
            Log::error('Failed to cancel booking:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to cancel booking. Please try again.');
        }
    }

    public function confirmBooking(Request $request, $id)
    {
        try {
            $company = Auth::guard('company')->user();
            if (!$company) {
                return redirect()->route('company.login')->with('error', 'Unauthorized access.');
            }

            $booking = Checkout::where('id', $id)
                ->where(function ($query) use ($company) {
                    $query->whereHas('destination', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('offer', fn($q) => $q->where('company_id', $company->id))
                        ->orWhereHas('package', fn($q) => $q->where('company_id', $company->id));
                })
                ->first();

            if (!$booking) {
                return back()->with('error', 'Booking not found or unauthorized.');
            }

            if ($booking->status !== 'pending') {
                return back()->with('error', 'Only pending bookings can be confirmed.');
            }

            $booking->status = 'confirmed';
            $booking->save();

        } catch (\Exception $e) {
            Log::error('Failed to confirm booking:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to confirm booking. Please try again.');
        }
    }
}
