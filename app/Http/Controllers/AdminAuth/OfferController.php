<?php

namespace App\Http\Controllers\AdminAuth;
/* X */
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Destination;
use App\Models\Offer;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class OfferController extends Controller
{
    public function index()
    {
        $offers = Offer::with(['company', 'destination'])->get()->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title ?? 'Unknown Offer',
                'location' => $offer->location ?? 'Unknown Location',
                'category' => $offer->category ?? '',
                'price' => $offer->price ?? 0,
                'discount_price' => $offer->discount_price ?? null,
                'discount_type' => $offer->discount_type ?? '',
                'start_date' => $offer->start_date ? $offer->start_date->format('Y-m-d') : null,
                'end_date' => $offer->end_date ? $offer->end_date->format('Y-m-d') : null,
                'image' => $offer->image ? Storage::url($offer->image) : null,
                'description' => $offer->description ?? '',
                'average_rating' => $offer->average_rating,
                'is_active' => $offer->is_active ?? false,
                'company_id' => $offer->company_id,
                'company' => $offer->company ? [
                    'id' => $offer->company->id,
                    'company_name' => $offer->company->company_name,
                ] : null,
                'destination_id' => $offer->destination_id,
                'duration' => $offer->duration,
                'group_size' => $offer->group_size,
            ];
        });

        $companies = Company::select(['id', 'company_name'])->where('is_active', true)->get();
        $destinations = Destination::select(['id', 'title', 'location'])->get();

        return Inertia::render('Admin/Deals/AdminDeals', [
            'offers' => $offers,
            'companies' => $companies,
            'destinations' => $destinations,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string|min:10',
                'location' => 'required|string|max:255',
                'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'price' => 'required|numeric|min:0',
                'discount_price' => 'nullable|numeric|min:0|lt:price',
                'discount_type' => 'nullable|in:percentage,fixed',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'company_id' => 'required|exists:companies,id',
                'destination_id' => 'required|exists:destinations,id',
                'is_active' => 'boolean',
                'duration' => 'nullable|string|max:50',
                'group_size' => 'nullable|string|max:50',
            ]);

            $data = $validated;
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('offers', 'public');
            }

            $data['is_active'] = $data['is_active'] ?? true;

            Offer::create($data);

            return redirect()->route('admin.offers.index')->with('success', 'Offer created successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create offer: ' . $e->getMessage());
            return back()->with('error', 'Failed to create offer: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $offer = Offer::findOrFail($id);

            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string|min:10',
                'location' => 'nullable|string|max:255',
                'category' => 'nullable|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'price' => 'nullable|numeric|min:0',
                'discount_price' => 'nullable|numeric|min:0',
                'discount_type' => 'nullable|in:percentage,fixed',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'company_id' => 'nullable|exists:companies,id',
                'destination_id' => 'nullable|exists:destinations,id',
                'is_active' => 'nullable|boolean',
                'duration' => 'nullable|string|max:50',
                'group_size' => 'nullable|string|max:50',
            ]);

            if (
                isset($validated['discount_price']) && isset($validated['price']) &&
                $validated['discount_price'] >= $validated['price']
            ) {
                throw ValidationException::withMessages([
                    'discount_price' => 'Discount price must be less than regular price',
                ]);
            }

            $data = [
                'title' => $validated['title'] ?? $offer->title,
                'description' => $validated['description'] ?? $offer->description,
                'location' => $validated['location'] ?? $offer->location,
                'category' => $validated['category'] ?? $offer->category,
                'price' => $validated['price'] ?? $offer->price,
                'discount_price' => isset($validated['discount_price']) ? ($validated['discount_price'] ?: null) : $offer->discount_price,
                'discount_type' => $validated['discount_type'] ?? $offer->discount_type,
                'start_date' => $validated['start_date'] ?? $offer->start_date,
                'end_date' => $validated['end_date'] ?? $offer->end_date,
                'company_id' => $validated['company_id'] ?? $offer->company_id,
                'destination_id' => $validated['destination_id'] ?? $offer->destination_id,
                'is_active' => $validated['is_active'] ?? $offer->is_active,
                'duration' => $validated['duration'] ?? $offer->duration,
                'group_size' => $validated['group_size'] ?? $offer->group_size,
            ];

            if ($request->hasFile('image')) {
                if ($offer->image) {
                    Storage::disk('public')->delete($offer->image);
                }
                $data['image'] = $request->file('image')->store('offers', 'public');
            }

            $offer->update($data);

            return redirect()->route('admin.offers.index')->with('success', 'Offer updated successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to update offer: ' . $e->getMessage(), ['id' => $id]);
            return back()->with('error', 'Failed to update offer: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $offer = Offer::findOrFail($id);
            if ($offer->image) {
                Storage::disk('public')->delete($offer->image);
            }
            $offer->delete();

            return redirect()->route('admin.offers.index')->with('success', 'Offer deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete offer: ' . $e->getMessage(), ['id' => $id]);
            return back()->with('error', 'Failed to delete offer: ' . $e->getMessage());
        }
    }

    public function toggleActive($id)
    {
        try {
            $offer = Offer::findOrFail($id);
            $offer->is_active = !$offer->is_active;
            $offer->save();

            $message = $offer->is_active ? 'Offer activated successfully.' : 'Offer deactivated successfully.';
            return redirect()->route('admin.offers.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle offer active status: ' . $e->getMessage(), ['id' => $id]);
            return back()->with('error', 'Failed to toggle offer status: ' . $e->getMessage());
        }
    }

    // public function submitRating(Request $request, $id)
    // {
    //     try {
    //         $offer = Offer::findOrFail($id);

    //         $validated = $request->validate([
    //             'rating' => 'required|numeric|min:1|max:5',
    //             'comment' => 'nullable|string|max:1000',
    //         ]);

    //         $user = Auth::user();
    //         if (!$user) {
    //             throw ValidationException::withMessages(['user' => 'You must be logged in to submit a rating.']);
    //         }

    //         // Check if the user has booked and completed this offer
    //         $hasBooked = $offer->bookings()
    //             ->where('user_id', $user->id)
    //             ->where('status', 'completed')
    //             ->exists();

    //         if (!$hasBooked) {
    //             throw ValidationException::withMessages([
    //                 'rating' => 'You can only rate offers you have booked and completed.',
    //             ]);
    //         }

    //         Review::updateOrCreate(
    //             [
    //                 'user_id' => $user->id,
    //                 'reviewable_type' => 'offer',
    //                 'reviewable_id' => $offer->id,
    //             ],
    //             [
    //                 'rating' => $validated['rating'],
    //                 'comment' => $validated['comment'] ?? null,
    //             ]
    //         );

    //         return redirect()->back()->with('success', 'Rating submitted successfully.');
    //     } catch (ValidationException $e) {
    //         return back()->withErrors($e->errors())->withInput();
    //     } catch (\Exception $e) {
    //         Log::error('Failed to submit rating: ' . $e->getMessage(), ['offer_id' => $id]);
    //         return back()->with('error', 'Failed to submit rating: ' . $e->getMessage());
    //     }
    // }
}
