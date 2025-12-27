<?php

namespace App\Http\Controllers\AdminAuth;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Company;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PackagesController extends Controller
{
    public function indexPublic()
    {
        $packages = Package::with(['company', 'destination'])->get();
        return Inertia::render('Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function show(Package $package)
    {
        $package->load(['company', 'destination']);

        $user = auth()->guard('web')->user();
        $packageData = $package->toArray();
        $packageData['image'] = $package->image ? Storage::url($package->image) : null;
        $packageData['company'] = $package->company ? [
            'id' => $package->company->id,
            'company_name' => $package->company->company_name,
        ] : null;
        $packageData['destination'] = $package->destination ? [
            'id' => $package->destination->id,
            'title' => $package->destination->title,
        ] : null;

        if ($user) {
            $favorite = $user->favorites()
                ->where('package_id', $package->id)
                ->first();
            $packageData['is_favorite'] = !!$favorite;
            $packageData['favorite_id'] = $favorite ? $favorite->id : null;
        } else {
            $packageData['is_favorite'] = false;
            $packageData['favorite_id'] = null;
        }

        return Inertia::render('Packages/Show', [
            'package' => $packageData,
            'auth' => ['user' => $user ? $user->only('id', 'name', 'email') : null],
        ]);
    }

    public function index()
    {
        $packages = Package::with(['company', 'destination'])->get()->map(function ($package) {
            return [
                'id' => $package->id,
                'company' => $package->company ? [
                    'id' => $package->company->id,
                    'name' => $package->company->company_name
                ] : null,
                'destination_id' => $package->destination_id,
                'destination' => $package->destination ? [
                    'id' => $package->destination->id,
                    'name' => $package->destination->title
                ] : null,
                'title' => $package->title,
                'subtitle' => $package->subtitle,
                'description' => $package->description,
                'price' => $package->price,
                'discount_price' => $package->discount_price,
                'discount_type' => $package->discount_type,
                'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                'image' => $package->image ? Storage::url($package->image) : null,
                'is_featured' => $package->is_featured,
                'location' => $package->location,
                'created_at' => $package->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $package->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        $companies = Company::select('id', 'company_name')->get()->map(function ($company) {
            return [
                'id' => $company->id,
                'company_name' => $company->company_name,
            ];
        });

        $destinations = Destination::select('id', 'title')->get()->map(function ($destination) {
            return [
                'id' => $destination->id,
                'name' => $destination->title,
            ];
        });

        return Inertia::render('Admin/Packages/AdminPackage', [
            'packages' => $packages,
            'companies' => $companies,
            'destinations' => $destinations,
            'auth' => Auth::guard('admin')->user(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'destination_id' => 'required|exists:destinations,id',
            'title' => 'required|string|max:255|min:3',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'required|string|min:10|max:5000',
            'price' => 'required|numeric|min:0.01',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'discount_type' => 'nullable|in:percentage,fixed',
            'start_date' => 'nullable|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'image' => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_featured' => 'boolean',
            'location' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $validated['image'] = $request->file('image')->store('packages', 'public');
        } else {
            return back()->withErrors(['image' => 'Invalid or missing image file.']);
        }

        Package::create($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Package created successfully.');
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'destination_id' => 'required|exists:destinations,id',
            'title' => 'required|string|max:255|min:3',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'required|string|min:10|max:5000',
            'price' => 'required|numeric|min:0.01',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'discount_type' => 'nullable|in:percentage,fixed',
            'start_date' => 'nullable|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_featured' => 'boolean',
            'location' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($package->image && Storage::disk('public')->exists($package->image)) {
                Storage::disk('public')->delete($package->image);
            }
            $validated['image'] = $request->file('image')->store('packages', 'public');
        } else {
            unset($validated['image']);
        }

        $validated['is_featured'] = isset($validated['is_featured']) ? (bool) $validated['is_featured'] : false;

        $package->update($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package)
    {
        if ($package->image && Storage::disk('public')->exists($package->image)) {
            Storage::disk('public')->delete($package->image);
        }
        $package->delete();

        return redirect()->route('admin.packages.index')->with('success', 'Package deleted successfully.');
    }

    public function toggleFeatured(Package $package)
    {
        $package->is_featured = !$package->is_featured;
        $package->save();

        $message = $package->is_featured ? 'Package set as featured.' : 'Package removed from featured.';
        return redirect()->route('admin.packages.index')->with('success', $message);
    }
}
