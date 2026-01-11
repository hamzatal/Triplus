<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Company;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DestinationController extends Controller
{
    /**
     * معالجة مسار الصورة بشكل صحيح
     */
    private function getImageUrl($image)
    {
        if (!$image) {
            return null;
        }

        if (str_starts_with($image, 'http')) {
            return $image;
        }

        if (str_starts_with($image, 'storage/')) {
            return asset($image);
        }

        return Storage::url($image);
    }

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
                    'image' => $this->getImageUrl($destination->image), // ✅ استخدام الدالة الجديدة
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
        try {
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

            $imagePath = $request->file('image')->store('destinations', 'public');

            Destination::create([
                'company_id' => $validated['company_id'],
                'title' => $validated['title'],
                'location' => $validated['location'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'image' => $imagePath,
                'price' => $validated['price'],
                'discount_price' => $validated['discount_price'] ?? null,
                'rating' => $validated['rating'] ?? 0,
                'is_featured' => filter_var($validated['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ]);

            return redirect()->route('admin.destinations.index')->with('success', 'Destination created successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create destination. Please try again.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $destination = Destination::findOrFail($id);

            $validated = $request->validate([
                'company_id' => 'sometimes|required|exists:companies,id',
                'title' => 'sometimes|required|string|min:3|max:255',
                'location' => 'sometimes|required|string|min:3|max:255',
                'category' => 'sometimes|required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'description' => 'sometimes|required|string|min:10|max:1000',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
                'price' => 'sometimes|required|numeric|min:0',
                'discount_price' => 'nullable|numeric|min:0',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_featured' => 'sometimes|boolean',
            ]);

            if (isset($validated['discount_price'])) {
                $price = $validated['price'] ?? $destination->price;
                if ($validated['discount_price'] >= $price) {
                    throw ValidationException::withMessages([
                        'discount_price' => ['Discount price must be less than the original price'],
                    ]);
                }
            }

            $data = [
                'company_id' => $validated['company_id'] ?? $destination->company_id,
                'title' => $validated['title'] ?? $destination->title,
                'location' => $validated['location'] ?? $destination->location,
                'category' => $validated['category'] ?? $destination->category,
                'description' => $validated['description'] ?? $destination->description,
                'price' => $validated['price'] ?? $destination->price,
                'discount_price' => $validated['discount_price'] ?? $destination->discount_price,
                'rating' => $validated['rating'] ?? $destination->rating,
                'is_featured' => isset($validated['is_featured'])
                    ? filter_var($validated['is_featured'], FILTER_VALIDATE_BOOLEAN)
                    : $destination->is_featured,
            ];

            if ($request->hasFile('image')) {
                if ($destination->image) {
                    Storage::disk('public')->delete($destination->image);
                }
                $data['image'] = $request->file('image')->store('destinations', 'public');
            }

            $destination->update($data);

            return redirect()->back()->with('success', 'Destination updated successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->with('error', 'Failed to update destination');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update destination: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $destination = Destination::findOrFail($id);

            if ($destination->image) {
                Storage::disk('public')->delete($destination->image);
            }

            $destination->delete();

            return redirect()->route('admin.destinations.index')->with('success', 'Destination deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete destination.');
        }
    }

    public function toggleFeatured($id)
    {
        try {
            $destination = Destination::findOrFail($id);
            $destination->update(['is_featured' => !$destination->is_featured]);

            $message = $destination->is_featured
                ? 'Destination added to featured successfully.'
                : 'Destination removed from featured successfully.';

            return redirect()->route('admin.destinations.index')->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to toggle featured status.');
        }
    }

    public function featured()
    {
        $destinations = Destination::where('is_featured', true)
            ->with('company')
            ->get();

        if ($destinations->isEmpty()) {
            $destinations = Destination::with('company')
                ->orderBy('created_at', 'desc')
                ->take(4)
                ->get();
        }

        return $destinations->map(function ($destination) {
            return [
                'id' => $destination->id,
                'title' => $destination->title,
                'location' => $destination->location,
                'category' => $destination->category,
                'description' => $destination->description,
                'image' => $this->getImageUrl($destination->image), // ✅ استخدام الدالة الجديدة
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
                'image' => $this->getImageUrl($destination->image), // ✅ استخدام الدالة الجديدة
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

        $favorites = Auth::guard('web')->check()
            ? Favorite::where('user_id', Auth::guard('web')->id())
            ->select(['id', 'user_id', 'destination_id', 'package_id', 'offer_id'])
            ->get()
            ->toArray()
            : [];

        return Inertia::render('Destinations/Index', [
            'destinations' => $destinations,
            'favorites' => $favorites,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function show($id)
    {
        try {
            $destination = Destination::with('company')->findOrFail($id);

            $favorite = Auth::guard('web')->check()
                ? Favorite::where('user_id', Auth::guard('web')->id())
                ->where('destination_id', $id)
                ->first()
                : null;

            return Inertia::render('Destinations/Show', [
                'destination' => [
                    'id' => $destination->id,
                    'title' => $destination->title,
                    'location' => $destination->location,
                    'category' => $destination->category,
                    'description' => $destination->description,
                    'image' => $this->getImageUrl($destination->image), // ✅ استخدام الدالة الجديدة
                    'price' => $destination->price,
                    'discount_price' => $destination->discount_price,
                    'rating' => $destination->rating,
                    'is_featured' => $destination->is_featured,
                    'is_favorite' => $favorite ? true : false,
                    'favorite_id' => $favorite ? $favorite->id : null,
                    'company' => $destination->company ? [
                        'id' => $destination->company->id,
                        'company_name' => $destination->company->company_name,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Errors/404', [
                'message' => 'Destination not found.',
            ]);
        }
    }
}
