<?php

namespace App\Http\Controllers\CompanyAuth;

use App\Http\Controllers\Controller;
use App\Models\{Destination, Package};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, Log};
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyPackageController extends Controller
{
    public function index()
    {
        try {
            $company = Auth::guard('company')->user();
            $packages = Package::where('company_id', $company->id)
                ->with('destination')
                ->paginate(10)
                ->through(function ($package) {
                    return [
                        'id' => $package->id,
                        'title' => $package->title,
                        'subtitle' => $package->subtitle,
                        'description' => $package->description,
                        'location' => $package->location,
                        'category' => $package->category,
                        'price' => (float)$package->price,
                        'discount_price' => $package->discount_price ? (float)$package->discount_price : null,
                        'discount_type' => $package->discount_type,
                        'start_date' => $package->start_date ? $package->start_date->format('Y-m-d') : null,
                        'end_date' => $package->end_date ? $package->end_date->format('Y-m-d') : null,
                        'image' => $package->image ? Storage::url($package->image) : null,
                        'is_active' => (bool)$package->is_active,
                        'is_featured' => (bool)$package->is_featured,
                        'rating' => $package->rating ? (float)$package->rating : null,
                        'destination_id' => $package->destination_id,
                        'destination' => $package->destination ? [
                            'id' => $package->destination->id,
                            'name' => $package->destination->title,
                        ] : null,
                    ];
                });

            return Inertia::render('Company/Dashboard', [
                'packages' => $packages,
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
            Log::error('Failed to fetch packages: ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load packages.');
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
                'subtitle' => 'nullable|string|max:255',
                'description' => 'required|string|min:10|max:5000',
                'location' => 'required|string|max:255',
                'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'required|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0|lt:price',
                'discount_type' => 'required|in:percentage,fixed',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
            ]);

            $destination = Destination::where('id', $validated['destination_id'])
                ->where('company_id', $company->id)
                ->firstOrFail();

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $validated['image'] = $request->file('image')->store('packages', 'public');
            } else {
                throw ValidationException::withMessages(['image' => 'Invalid or missing image file.']);
            }

            $validated['company_id'] = $company->id;
            $validated['is_active'] = $request->boolean('is_active', true);
            $validated['is_featured'] = $request->boolean('is_featured', false);

            Package::create($validated);

            return redirect()->back()->with('success', 'Package created successfully!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput()->with('error', 'Failed to create package. Please check the form.');
        } catch (\Exception $e) {
            Log::error('Failed to create package: ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create package.');
        }
    }

    public function update(Request $request, Package $package)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($package->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            // Debug: Log incoming request data
            Log::info('Package update request data:', $request->all());

            $validated = $request->validate([
                'destination_id' => 'sometimes|exists:destinations,id',
                'title' => 'sometimes|string|max:255|min:3',
                'subtitle' => 'nullable|string|max:255',
                'description' => 'sometimes|string|min:10|max:5000',
                'location' => 'sometimes|string|max:255',
                'category' => 'sometimes|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'sometimes|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0|lt:price',
                'discount_type' => 'sometimes|in:percentage,fixed',
                'start_date' => 'sometimes|date|after_or_equal:today',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_active' => 'sometimes|in:0,1,true,false', // Accept string or boolean
                'is_featured' => 'sometimes|in:0,1,true,false', // Accept string or boolean
            ]);

            // Convert string boolean values to actual boolean
            if (isset($validated['is_active'])) {
                $validated['is_active'] = in_array($validated['is_active'], ['1', 'true', true], true);
            }
            if (isset($validated['is_featured'])) {
                $validated['is_featured'] = in_array($validated['is_featured'], ['1', 'true', true], true);
            }

            // Validate destination ownership if destination_id is being updated
            if (isset($validated['destination_id'])) {
                $destination = Destination::where('id', $validated['destination_id'])
                    ->where('company_id', $company->id)
                    ->firstOrFail();
            }

            // Handle image upload
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                // Delete old image
                if ($package->image) {
                    Storage::disk('public')->delete($package->image);
                }
                $validated['image'] = $request->file('image')->store('packages', 'public');
            } else {
                // Don't update image field if no new image
                unset($validated['image']);
            }

            // Remove empty values to avoid overwriting with empty strings
            $validated = array_filter($validated, function ($value, $key) {
                // Keep boolean false values and numeric zeros
                if (in_array($key, ['is_active', 'is_featured']) && is_bool($value)) {
                    return true;
                }
                if (is_numeric($value)) {
                    return true;
                }
                // Remove empty strings and null values for other fields
                return !empty($value);
            }, ARRAY_FILTER_USE_BOTH);

            Log::info('Package validated data:', $validated);

            $package->update($validated);

            return redirect()->back()->with('success', 'Package updated successfully!');
        } catch (ValidationException $e) {
            Log::error('Package validation errors:', $e->errors());
            return back()->withErrors($e->errors())->withInput()->with('error', 'Failed to update package. Please check the form.');
        } catch (\Exception $e) {
            Log::error('Failed to update package ID ' . $package->id . ': ', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Failed to update package.');
        }
    }


    public function destroy(Package $package)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($package->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            if ($package->image) {
                Storage::disk('public')->delete($package->image);
            }
            $package->delete();

            return redirect()->back()->with('success', 'Package deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete package ID ' . $package->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete package.');
        }
    }

    public function toggleFeatured(Package $package)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($package->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $package->is_featured = !$package->is_featured;
            $package->save();

            $message = $package->is_featured ? 'Package set as featured.' : 'Package removed from featured.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle featured status for package ID ' . $package->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to toggle featured status.');
        }
    }

    public function toggleActive(Package $package)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($package->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $package->is_active = !$package->is_active;
            $package->save();

            $message = $package->is_active ? 'Package activated.' : 'Package deactivated.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle active status for package ID ' . $package->id . ': ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to toggle active status.');
        }
    }
}
