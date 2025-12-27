<?php

namespace App\Http\Controllers;
/* X */

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PackagesController extends Controller
{
    public function indexPublic()
    {
        $packages = Package::with('company')->get();
        return Inertia::render('Packages/Index', [
            'packages' => $packages->map(function ($package) {
                return [
                    'id' => $package->id,
                    'title' => $package->title,
                    'subtitle' => $package->subtitle,
                    'description' => $package->description,
                    'location' => $package->location,
                    'category' => $package->category,
                    'price' => $package->price,
                    'discount_price' => $package->discount_price,
                    'discount_type' => $package->discount_type,
                    'image' => $package->image ? Storage::url($package->image) : null,
                    'rating' => $package->rating,
                    'is_featured' => $package->is_featured,
                    'is_active' => $package->is_active,
                    'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                    'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                    'duration' => $package->duration,
                    'group_size' => $package->group_size,
                    'company' => $package->company ? [
                        'id' => $package->company->id,
                        'company_name' => $package->company->company_name,
                    ] : null,
                ];
            }),
        ]);
    }

    public function index()
    {
        $user = auth()->user();
        $packages = $user->is_company
            ? Package::where('company_id', $user->id)->get()
            : Package::all();
        return Inertia::render('Company/Packages/Index', [
            'packages' => $packages->map(function ($package) {
                return [
                    'id' => $package->id,
                    'title' => $package->title,
                    'subtitle' => $package->subtitle,
                    'description' => $package->description,
                    'location' => $package->location,
                    'category' => $package->category,
                    'price' => $package->price,
                    'discount_price' => $package->discount_price,
                    'discount_type' => $package->discount_type,
                    'image' => $package->image ? Storage::url($package->image) : null,
                    'rating' => $package->rating,
                    'is_featured' => $package->is_featured,
                    'is_active' => $package->is_active,
                    'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                    'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                    'duration' => $package->duration,
                    'group_size' => $package->group_size,
                ];
            }),
            'auth' => $user,
        ]);
    }

    public function create()
    {
        return Inertia::render('Company/Packages/Create', [
            'auth' => auth()->user(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'duration' => 'nullable|string|max:255',
            'group_size' => 'nullable|string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['company_id'] = auth()->user()->id;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('packages', 'public');
        }

        Package::create($validated);

        return redirect()->route('company.packages.index')->with('success', 'Package created successfully.');
    }

    public function edit(Package $package)
    {
        $this->authorize('update', $package);
        return Inertia::render('Company/Packages/Edit', [
            'package' => $package,
            'auth' => auth()->user(),
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $this->authorize('update', $package);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'duration' => 'nullable|string|max:255',
            'group_size' => 'nullable|string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($package->image) {
                Storage::disk('public')->delete($package->image);
            }
            $validated['image'] = $request->file('image')->store('packages', 'public');
        }

        $package->update($validated);

        return redirect()->route('company.packages.index')->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package)
    {
        $this->authorize('delete', $package);
        if ($package->image) {
            Storage::disk('public')->delete($package->image);
        }
        $package->delete();

        return redirect()->route('company.packages.index')->with('success', 'Package deleted successfully.');
    }

    public function show(Package $package)
    {
        $package->load('company');
        return Inertia::render('Packages/Show', [
            'package' => [
                'id' => $package->id,
                'title' => $package->title,
                'subtitle' => $package->subtitle,
                'description' => $package->description,
                'location' => $package->location,
                'category' => $package->category,
                'price' => $package->price,
                'discount_price' => $package->discount_price,
                'discount_type' => $package->discount_type,
                'image' => $package->image ? Storage::url($package->image) : null,
                'rating' => $package->rating,
                'is_featured' => $package->is_featured,
                'is_active' => $package->is_active,
                'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                'duration' => $package->duration,
                'group_size' => $package->group_size,
                'company' => $package->company ? [
                    'id' => $package->company->id,
                    'company_name' => $package->company->company_name,
                ] : null,
            ],
            'auth' => auth()->user(),
        ]);
    }
}
