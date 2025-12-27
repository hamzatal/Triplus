<?php

namespace App\Http\Controllers;

/* X */ 
use App\Models\Destination;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::with('company')->get();
        return Inertia::render('Admin/Destinations/AdminDestinations', [
            'destinations' => $destinations->map(function ($destination) {
                return [
                    'id' => $destination->id,
                    'title' => $destination->title,
                    'location' => $destination->location,
                    'category' => $destination->category,
                    'description' => $destination->description,
                    'image' => $destination->image ? Storage::url($destination->image) : null,
                    'price' => $destination->price,
                    'discount_price' => $destination->discount_price,
                    'rating' => $destination->rating,
                    'is_featured' => $destination->is_featured,
                    'company' => $destination->company ? [
                        'id' => $destination->company->id,
                        'company_name' => $destination->company->company_name,
                    ] : null,
                ];
            }),
            'companies' => Company::select(['id', 'company_name'])->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'title' => 'required|string|min:3|max:255',
            'location' => 'required|string|min:3|max:255',
            'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
            'description' => 'required|string|min:10|max:1000',
            'image' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_featured' => 'boolean',
        ]);

        Log::info('Storing new destination', ['validated' => $validated]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('destinations', 'public');
        }

        Destination::create($validated);

        return redirect()->route('admin.destinations.index')->with('success', 'Destination created successfully.');
    }

    public function update(Request $request, Destination $destination)
    {
        Log::info('Attempting to update destination', [
            'id' => $destination->id,
            'before' => $destination->toArray(),
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'title' => 'required|string|min:3|max:255',
            'location' => 'required|string|min:3|max:255',
            'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
            'description' => 'required|string|min:10|max:1000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_featured' => 'boolean',
        ]);

        Log::info('Validated data for update', [
            'id' => $destination->id,
            'validated' => $validated,
        ]);

        if ($request->hasFile('image')) {
            if ($destination->image) {
                Storage::disk('public')->delete($destination->image);
            }
            $validated['image'] = $request->file('image')->store('destinations', 'public');
        } else {
            unset($validated['image']); // Prevent overwriting existing image
        }

        // Force boolean conversion for is_featured
        $validated['is_featured'] = filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN);

        try {
            $updated = $destination->update($validated);
            $destination->refresh(); // Reload model to get latest data

            Log::info('Update attempt result', [
                'id' => $destination->id,
                'updated' => $updated,
                'after' => $destination->toArray(),
            ]);

            if (!$updated) {
                Log::error('Update returned false, no changes applied', [
                    'id' => $destination->id,
                    'validated' => $validated,
                ]);
                return back()->with('error', 'Failed to update destination.');
            }

            return redirect()->route('admin.destinations.index')->with('success', 'Destination updated successfully.');
        } catch (\Exception $e) {
            Log::error('Exception during destination update', [
                'id' => $destination->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'An error occurred while updating the destination.');
        }
    }

    public function destroy(Destination $destination)
    {
        if ($destination->image) {
            Storage::disk('public')->delete($destination->image);
        }
        $destination->delete();

        return redirect()->route('admin.destinations.index')->with('success', 'Destination deleted successfully.');
    }

    public function toggleFeatured(Destination $destination)
    {
        $destination->update(['is_featured' => !$destination->is_featured]);
        $message = $destination->is_featured
            ? 'Destination added to featured successfully.'
            : 'Destination removed from featured successfully.';
        return redirect()->route('admin.destinations.index')->with('success', $message);
    }

    public function featured()
    {
        $destinations = Destination::where('is_featured', true)->with('company')->get();
        if ($destinations->isEmpty()) {
            $destinations = Destination::with('company')->orderBy('created_at', 'desc')->take(4)->get();
        }
        return $destinations->map(function ($destination) {
            return [
                'id' => $destination->id,
                'title' => $destination->title,
                'location' => $destination->location,
                'category' => $destination->category,
                'description' => $destination->description,
                'image' => $destination->image ? Storage::url($destination->image) : null,
                'price' => $destination->price,
                'discount_price' => $destination->discount_price,
                'rating' => $destination->rating,
                'is_featured' => $destination->is_featured,
                'company' => $destination->company ? [
                    'id' => $destination->company->id,
                    'company_name' => $destination->company->company_name,
                ] : null,
            ];
        });
    }

    public function allDestinations(Request $request)
    {
        $query = Destination::query()->with('company');
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('company', function ($q) use ($search) {
                        $q->where('company_name', 'like', "%{$search}%");
                    });
            });
        }
        $destinations = $query->get()->map(function ($destination) {
            return [
                'id' => $destination->id,
                'title' => $destination->title,
                'location' => $destination->location,
                'category' => $destination->category,
                'description' => $destination->description,
                'image' => $destination->image ? Storage::url($destination->image) : null,
                'price' => $destination->price,
                'discount_price' => $destination->discount_price,
                'rating' => $destination->rating,
                'is_featured' => $destination->is_featured,
                'company' => $destination->company ? [
                    'id' => $destination->company->id,
                    'company_name' => $destination->company->company_name,
                ] : null,
            ];
        });
        return Inertia::render('DestinationsPage', ['destinations' => $destinations]);
    }

    public function show(Destination $destination)
    {
        $destination->load('company');
        return Inertia::render('DestinationDetails', [
            'destination' => [
                'id' => $destination->id,
                'title' => $destination->title,
                'location' => $destination->location,
                'category' => $destination->category,
                'description' => $destination->description,
                'image' => $destination->image ? Storage::url($destination->image) : null,
                'price' => $destination->price,
                'discount_price' => $destination->discount_price,
                'rating' => $destination->rating,
                'is_featured' => $destination->is_featured,
                'company' => $destination->company ? [
                    'id' => $destination->company->id,
                    'company_name' => $destination->company->company_name,
                ] : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
