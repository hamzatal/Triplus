<?php

namespace App\Http\Controllers\CompanyAuth;

use App\Http\Controllers\Controller;
use App\Models\{Destination, Offer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, Log};
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyOfferController extends Controller
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
        try {
            $company = Auth::guard('company')->user();
            $offers = Offer::where('company_id', $company->id)
                ->with('destination')
                ->paginate(8)
                ->through(function ($offer) {
                    return [
                        'id' => $offer->id,
                        'title' => $offer->title,
                        'description' => $offer->description,
                        'location' => $offer->location,
                        'category' => $offer->category,
                        'price' => (float)$offer->price,
                        'discount_price' => $offer->discount_price ? (float)$offer->discount_price : null,
                        'discount_type' => $offer->discount_type,
                        'start_date' => $offer->start_date ? $offer->start_date->format('Y-m-d') : null,
                        'end_date' => $offer->end_date ? $offer->end_date->format('Y-m-d') : null,
                        'image' => $this->getImageUrl($offer->image), // ✅ استخدام الدالة الجديدة
                        'is_active' => (bool)$offer->is_active,
                        'rating' => $offer->rating ? (float)$offer->rating : null,
                        'destination_id' => $offer->destination_id,
                        'destination' => $offer->destination ? [
                            'id' => $offer->destination->id,
                            'name' => $offer->destination->title,
                        ] : null,
                    ];
                });

            return Inertia::render('Company/Dashboard', [
                'offers' => $offers,
                'company' => [
                    'id' => $company->id,
                    'company_name' => $company->company_name,
                    'email' => $company->email,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch offers: ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load offers.');
        }
    }

    public function store(Request $request)
    {
        try {
            $company = Auth::guard('company')->user();
            if (!$company->is_active) {
                return back()->with('error', 'Your company account is not active.');
            }

            $validated = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'title' => 'required|string|max:255|min:3',
                'description' => 'required|string|min:10|max:5000',
                'location' => 'required|string|max:255',
                'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'required|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0.01|lt:price', // ✅ مع min:0.01
                'discount_type' => 'nullable|in:percentage,fixed,seasonal,early-bird', // ✅ nullable بدل required
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_active' => 'boolean',
            ], [
                'discount_price.lt' => 'Discount price must be less than the original price.',
                'discount_price.min' => 'Discount price must be greater than zero.',
            ]);

            // ✅ التحقق من أن discount_price و discount_type يأتيان معًا
            if ($request->filled('discount_price') && !$request->filled('discount_type')) {
                return back()->withErrors([
                    'discount_type' => 'Discount type is required when discount price is provided.'
                ])->withInput();
            }

            if ($request->filled('discount_type') && !$request->filled('discount_price')) {
                return back()->withErrors([
                    'discount_price' => 'Discount price is required when discount type is provided.'
                ])->withInput();
            }

            // التحقق من الوجهة
            $destination = Destination::where('id', $validated['destination_id'])
                ->where('company_id', $company->id)
                ->firstOrFail();

            // معالجة الصورة
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $validated['image'] = $request->file('image')->store('offers', 'public');
            } else {
                throw ValidationException::withMessages(['image' => 'Invalid or missing image file.']);
            }

            $validated['company_id'] = $company->id;
            $validated['is_active'] = $request->boolean('is_active', true);

            // ✅ إذا ما في خصم، احذف الحقول
            if (!$request->filled('discount_price')) {
                $validated['discount_price'] = null;
                $validated['discount_type'] = null;
            }

            Offer::create($validated);

            return redirect()->back()->with('success', 'Offer created successfully!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput()->with('error', 'Failed to create offer. Please check the form.');
        } catch (\Exception $e) {
            Log::error('Failed to create offer: ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create offer.');
        }
    }

    public function update(Request $request, Offer $offer)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($offer->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $validated = $request->validate([
                'destination_id' => 'sometimes|exists:destinations,id',
                'title' => 'sometimes|string|max:255|min:3',
                'description' => 'sometimes|string|min:10|max:5000',
                'location' => 'sometimes|string|max:255',
                'category' => 'sometimes|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'sometimes|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0.01|lt:price', // ✅ مع min:0.01
                'discount_type' => 'nullable|in:percentage,fixed,seasonal,early-bird', // ✅ nullable
                'start_date' => 'sometimes|date|after_or_equal:today',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_active' => 'sometimes|boolean',
            ], [
                'discount_price.lt' => 'Discount price must be less than the original price.',
                'discount_price.min' => 'Discount price must be greater than zero.',
            ]);

            // ✅ التحقق من أن discount_price و discount_type يأتيان معًا
            if ($request->has('discount_price') && $request->filled('discount_price') && !$request->filled('discount_type')) {
                return back()->withErrors([
                    'discount_type' => 'Discount type is required when discount price is provided.'
                ])->withInput();
            }

            if ($request->has('discount_type') && $request->filled('discount_type') && !$request->filled('discount_price')) {
                return back()->withErrors([
                    'discount_price' => 'Discount price is required when discount type is provided.'
                ])->withInput();
            }

            // ✅ إذا المستخدم حذف الخصم (حط قيمة فارغة)، احذفه من الـ database
            if ($request->has('discount_price') && empty($request->input('discount_price'))) {
                $validated['discount_price'] = null;
                $validated['discount_type'] = null;
            }

            // التحقق من الوجهة
            if (isset($validated['destination_id'])) {
                $destination = Destination::where('id', $validated['destination_id'])
                    ->where('company_id', $company->id)
                    ->firstOrFail();
            }

            // معالجة الصورة
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                if ($offer->image) {
                    Storage::disk('public')->delete($offer->image);
                }
                $validated['image'] = $request->file('image')->store('offers', 'public');
            } else {
                unset($validated['image']);
            }

            $offer->update($validated);

            return redirect()->back()->with('success', 'Offer updated successfully!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput()->with('error', 'Failed to update offer. Please check the form.');
        } catch (\Exception $e) {
            Log::error('Failed to update offer ID ' . $offer->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update offer.');
        }
    }

    public function destroy(Offer $offer)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($offer->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            if ($offer->image) {
                Storage::disk('public')->delete($offer->image);
            }
            $offer->delete();

            return redirect()->back()->with('success', 'Offer deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete offer ID ' . $offer->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete offer.');
        }
    }

    public function toggleActive(Offer $offer)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($offer->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $offer->is_active = !$offer->is_active;
            $offer->save();

            $message = $offer->is_active ? 'Offer activated.' : 'Offer deactivated.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle active status for offer ID ' . $offer->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to toggle active status.');
        }
    }
}
