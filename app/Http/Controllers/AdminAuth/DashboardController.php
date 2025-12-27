<?php

namespace App\Http\Controllers\AdminAuth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Contact;
use App\Models\Company;
use App\Models\Destination;
use App\Models\Offer;
use App\Models\Package;
use App\Models\Checkout;
use App\Models\HeroSection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $admin = Auth::guard('admin')->user();

            $stats = [
                'users' => User::count(),
                'deactivated_users' => User::where('is_active', 0)->count(),
                'companies' => Company::count(),
                'active_companies' => Company::where('is_active', 1)->count(),
                'deactivated_companies' => Company::where('is_active', 0)->count(),
                'messages' => Contact::count(),
                'unread_messages' => Contact::where('is_read', false)->count(),
                'destinations' => Destination::count(),
                'offers' => Offer::count(),
                'packages' => Package::count(),
                'bookings' => Checkout::count(),
                'hero_sections' => HeroSection::count(),
            ];

            $latestUsers = User::select('id', 'name', 'email', 'created_at')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            $latestMessages = Contact::select('id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            $latestBookings = Checkout::with(['user', 'company', 'destination', 'offer', 'package'])
                ->select(['id', 'user_id', 'company_id', 'destination_id', 'offer_id', 'package_id', 'status', 'total_price', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'user' => $booking->user ? ['id' => $booking->user->id, 'name' => $booking->user->name] : null,
                        'company' => $booking->company ? ['id' => $booking->company->id, 'name' => $booking->company->company_name] : null,
                        'destination' => $booking->destination ? ['id' => $booking->destination->id, 'name' => $booking->destination->title] : null,
                        'offer' => $booking->offer ? ['id' => $booking->offer->id, 'title' => $booking->offer->title] : null,
                        'package' => $booking->package ? ['id' => $booking->package->id, 'title' => $booking->package->title] : null,
                        'status' => $booking->status,
                        'total_price' => $booking->total_price,
                        'created_at' => $booking->created_at,
                    ];
                });

            return Inertia::render('Admin/Dashboard', [
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'avatar' => $admin->avatar ? Storage::url($admin->avatar) : null,
                ],
                'stats' => $stats,
                'latest_users' => $latestUsers,
                'latest_messages' => $latestMessages,
                'latest_bookings' => $latestBookings,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load admin dashboard:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load dashboard.');
        }
    }
}
