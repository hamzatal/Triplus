<?php

// ===================================================
//! Admin Authentication
// ===================================================

use App\Http\Controllers\AdminAuth\AdminController;
use App\Http\Controllers\AdminAuth\DashboardController;
use App\Http\Controllers\AdminAuth\HeroSectionController;
use App\Http\Controllers\AdminAuth\LoginController;
use App\Http\Controllers\AdminAuth\OfferController as AdminOfferController;
use App\Http\Controllers\AdminAuth\PackagesController;
use App\Http\Controllers\AdminAuth\CompanyInfoController;

// ===================================================
//! User Authentication
// ===================================================

use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserBookingsController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ContactController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\ChatGPTServices;

// ===================================================
//! Company Authentication
// ===================================================

use App\Http\Controllers\CompanyAuth\CompanyController;
use App\Http\Controllers\CompanyAuth\CompanyDashboardController;
use App\Http\Controllers\CompanyAuth\CompanyDestinationController;
use App\Http\Controllers\CompanyAuth\CompanyOfferController;
use App\Http\Controllers\CompanyAuth\CompanyPackageController;

// ===================================================
//! Middleware Imports
// ===================================================

use App\Http\Middleware\CheckOfferValidity;

// ===================================================
//! Authentication Routes (Keep Public)
// ===================================================

require __DIR__ . '/auth.php';

// ===================================================
//! Public Routes (Not Authenticated)
// ===================================================

Route::get('/about-us', fn() => Inertia::render('about-us'))->name('about-us');
Route::get('/ContactPage', fn() => Inertia::render('ContactPage'))->name('ContactPage');
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');
Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');

// ===================================================
//! Company Authentication Routes (Public)
// ===================================================

Route::post('/company/login', [CompanyController::class, 'login'])->name('company.login');

// ===================================================
//! Admin Authentication Routes (Public)
// ===================================================

Route::get('/admin/login', [LoginController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [LoginController::class, 'store'])->name('admin.login.submit');

// ===================================================
//! Protected Routes - Shared between Users and Companies
// ===================================================

Route::middleware(['auth:web,company', 'verified'])->group(function () {
    // Home page accessible to both regular users and companies
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Public routes that both user types can access
    Route::get('/destinations', [DestinationController::class, 'allDestinations'])->name('destinations.index');
    Route::get('/destinations/{id}', [DestinationController::class, 'show'])->name('destinations.show');
    Route::get('/packages', [PackagesController::class, 'indexPublic'])->name('packages.index');
    Route::get('/packages/{package}', [PackagesController::class, 'show'])->name('packages.show');
    Route::get('/offers', [OfferController::class, 'index'])->name('offers');
    Route::get('/offers/{offer}', [OfferController::class, 'show'])->name('offers.show');

    // Search routes - accessible to both users and companies
    Route::get('/search', [SearchController::class, 'index'])->name('search');
    Route::get('/search/live', [SearchController::class, 'live'])->name('search.live');

    // Booking page view - accessible to both users and companies (read-only for companies)
    Route::get('/booking', [BookingController::class, 'index'])->name('booking.index');
});

// ===================================================
//! Protected Routes - Regular Users Only
// ===================================================

Route::middleware(['auth:web', 'verified', 'active'])->group(function () {
    // User-specific booking routes
    Route::get('/UserBookings', [UserBookingsController::class, 'index'])->name('bookings.index');

    // Booking routes with offer validity check
    Route::get('/book', [BookingController::class, 'create'])
        ->middleware(CheckOfferValidity::class)
        ->name('book.create');

    Route::post('/book', [BookingController::class, 'store'])
        ->middleware(CheckOfferValidity::class)
        ->name('book.store');

    Route::delete('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->middleware('auth:web');

    // Add rating route for regular users
    Route::post('/bookings/{bookingId}/rate', [UserBookingsController::class, 'submitRating'])->name('bookings.rate');

    // User profile page
    Route::get('/UserProfile', fn() => Inertia::render('UserProfile', ['user' => Auth::user()]))->name('UserProfile');

    // Profile management routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/', [ProfileController::class, 'deactivate'])->name('deactivate');
        Route::post('/reactivate', [ProfileController::class, 'reactivate'])->name('reactivate');
    });

    // Favorite destinations, packages, and offers
    Route::post('/favorites', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');
});

// ===================================================
//! API Routes (Regular Users Only)
// ===================================================

Route::middleware(['auth:web', 'verified'])->prefix('api')->name('api.')->group(function () {
    Route::get('/profile', [ProfileController::class, 'getProfile'])->name('profile.get');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/user', [UserController::class, 'getUser'])->name('user.get');
    Route::post('/update', [UserController::class, 'updateUser'])->name('user.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::put('/profile/deactivate', [ProfileController::class, 'deactivate'])->name('profile.deactivate');
});

// ===================================================
//! Admin Protected Routes
// ===================================================

Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin authentication
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Company info
    Route::get('/company-info', [CompanyInfoController::class, 'index'])->name('company-info.index');
    Route::post('/company-info/{id}/toggle-active', [CompanyInfoController::class, 'toggleActive'])->name('company-info.toggle-active');
    Route::delete('/company-info/{id}', [CompanyInfoController::class, 'destroy'])->name('company-info.destroy');
    Route::post('/company-info/{companyId}/destination/{id}/toggle-active', [CompanyInfoController::class, 'toggleDestinationActive'])->name('company-info.destination.toggle-active');
    Route::delete('/company-info/{companyId}/destination/{id}', [CompanyInfoController::class, 'destroyDestination'])->name('company-info.destination.destroy');
    Route::post('/company-info/{companyId}/offer/{id}/toggle-active', [CompanyInfoController::class, 'toggleOfferActive'])->name('company-info.offer.toggle-active');
    Route::delete('/company-info/{companyId}/offer/{id}', [CompanyInfoController::class, 'destroyOffer'])->name('company-info.offer.destroy');
    Route::post('/company-info/{companyId}/package/{id}/toggle-active', [CompanyInfoController::class, 'togglePackageActive'])->name('company-info.package.toggle-active');
    Route::delete('/company-info/{companyId}/package/{id}', [CompanyInfoController::class, 'destroyPackage'])->name('company-info.package.destroy');

    // Admin dashboard and profile
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [AdminController::class, 'getAdminProfile'])->name('profile');
    Route::put('/profile', [AdminController::class, 'updateAdminProfile'])->name('profile.update');
    Route::post('/profile', [AdminController::class, 'updateAdminProfile'])->name('profile.update');
    Route::post('/profile/password', [AdminController::class, 'updateAdminPassword'])->name('profile.password');

    // User management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::post('/{id}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('toggle-status');
    });

    // Messages and contacts
    Route::get('/messages', [AdminController::class, 'showContacts'])->name('messages');
    Route::get('/contacts', [AdminController::class, 'showContacts'])->name('contacts');
    Route::patch('/messages/{id}/read', [AdminController::class, 'markAsRead'])->name('messages.read');

    // Destinations management
    Route::prefix('destinations')->name('destinations.')->group(function () {
        Route::get('/', [DestinationController::class, 'index'])->name('index');
        Route::post('/', [DestinationController::class, 'store'])->name('store');
        Route::put('/{destination}', [DestinationController::class, 'update'])->name('update');
        Route::delete('/{destination}', [DestinationController::class, 'destroy'])->name('destroy');
        Route::patch('/{destination}/toggle-featured', [DestinationController::class, 'toggleFeatured'])->name('toggle-featured');
    });

    // Offers management
    Route::prefix('offers')->name('offers.')->group(function () {
        Route::get('/', [AdminOfferController::class, 'index'])->name('index');
        Route::post('/', [AdminOfferController::class, 'store'])->name('store');
        Route::put('/{id}', [AdminOfferController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminOfferController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/toggle', [AdminOfferController::class, 'toggleActive'])->name('toggle');
    });

    // Hero section management
    Route::prefix('hero')->name('hero.')->group(function () {
        Route::get('/', [HeroSectionController::class, 'index'])->name('index');
        Route::post('/', [HeroSectionController::class, 'store'])->name('store');
        Route::post('/{id}', [HeroSectionController::class, 'update'])->name('update');
        Route::patch('/{id}/toggle', [HeroSectionController::class, 'toggleActive'])->name('toggle');
        Route::delete('/{id}', [HeroSectionController::class, 'destroy'])->name('delete');
    });

    // Packages management
    Route::prefix('packages')->name('packages.')->group(function () {
        Route::get('/', [PackagesController::class, 'index'])->name('index');
        Route::post('/', [PackagesController::class, 'store'])->name('store');
        Route::post('/{package}', [PackagesController::class, 'update'])->name('update.post');
        Route::put('/{package}', [PackagesController::class, 'update'])->name('update');
        Route::patch('/{package}/toggle-featured', [PackagesController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::delete('/{package}', [PackagesController::class, 'destroy'])->name('destroy');
    });
});

// ===================================================
//! Company Protected Routes
// ===================================================

Route::middleware(['auth:company', 'verified'])->prefix('company')->name('company.')->group(function () {
    // Company authentication
    Route::post('/logout', [CompanyController::class, 'logout'])->name('logout');

    // Company dashboard and profile
    Route::get('/dashboard', [CompanyDashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [CompanyController::class, 'profile'])->name('profile');
    Route::put('/profile', [CompanyController::class, 'updateProfile'])->name('profile.update');
    Route::put('/profile/password', [CompanyController::class, 'updatePassword'])->name('profile.password');

    // Company bookings management
    Route::post('/bookings/{bookingId}/rate', [UserBookingsController::class, 'submitRating'])->name('bookings.rate');
    Route::delete('/bookings/{id}/cancel', [CompanyDashboardController::class, 'cancelBooking'])->name('bookings.cancel');
    Route::patch('/bookings/{id}/confirm', [CompanyDashboardController::class, 'confirmBooking'])->name('bookings.confirm');

    // Company destinations management
    Route::prefix('destinations')->name('destinations.')->group(function () {
        Route::get('/', [CompanyDestinationController::class, 'index'])->name('index');
        Route::post('/', [CompanyDestinationController::class, 'store'])->name('store');
        Route::put('/{destination}', [CompanyDestinationController::class, 'update'])->name('update');
        Route::delete('/{destination}', [CompanyDestinationController::class, 'destroy'])->name('destroy');
        Route::patch('/{destination}/toggle-featured', [CompanyDestinationController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::patch('/{destination}/toggle-active', [CompanyDestinationController::class, 'toggleActive'])->name('toggle-active');
    });

    // Company offers management
    Route::prefix('offers')->name('offers.')->group(function () {
        Route::get('/', [CompanyOfferController::class, 'index'])->name('index');
        Route::post('/', [CompanyOfferController::class, 'store'])->name('store');
        Route::put('/{offer}', [CompanyOfferController::class, 'update'])->name('update');
        Route::delete('/{offer}', [CompanyOfferController::class, 'destroy'])->name('destroy');
        Route::patch('/{offer}/toggle-active', [CompanyOfferController::class, 'toggleActive'])->name('toggle-active');
    });

    // Company packages management
    Route::prefix('packages')->name('packages.')->group(function () {
        Route::get('/', [CompanyPackageController::class, 'index'])->name('index');
        Route::post('/', [CompanyPackageController::class, 'store'])->name('store');
        Route::put('/{package}', [CompanyPackageController::class, 'update'])->name('update');
        Route::delete('/{package}', [CompanyPackageController::class, 'destroy'])->name('destroy');
        Route::patch('/{package}/toggle-featured', [CompanyPackageController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::patch('/{package}/toggle-active', [CompanyPackageController::class, 'toggleActive'])->name('toggle-active');
    });
});

// ===================================================
//! Chat Bot Routes
// ===================================================

Route::post('/chatbot', function (Request $request) {
    $chat = new ChatGPTServices();
    $response = $chat->handleUserMessage($request->input('message'));

    return response()->json(['response' => $response]);
});
Route::post('/chatbot', [ChatBotController::class, 'handleChat'])->name('chatbot.handle');

// ===================================================
//! Fallback Routes
// ===================================================

Route::get('/404', fn() => Inertia::render('Errors/404'))->name('404');
Route::fallback(fn() => Inertia::render('Errors/404'));
