<?php

namespace App\Http\Controllers\CompanyAuth;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, Log};
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyDestinationController extends Controller
{
    public function index()
    {
        try {
            $company = Auth::guard('company')->user();
            $destinations = Destination::where('company_id', $company->id)
                ->paginate(4)
                ->through(function ($destination) {
                    return [
                        'id' => $destination->id,
                        'title' => $destination->title,
                        'description' => $destination->description,
                        'location' => $destination->location,
                        'category' => $destination->category,
                        'price' => (float)$destination->price,
                        'discount_price' => $destination->discount_price ? (float)$destination->discount_price : null,
                        'image' => $destination->image ? Storage::url($destination->image) : null,
                        'rating' => $destination->rating ? (float)$destination->rating : null,
                        'is_featured' => (bool)$destination->is_featured,
                        'is_active' => (bool)$destination->is_active,
                    ];
                });

            return Inertia::render('Company/Dashboard', [
                'destinations' => $destinations,
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
            Log::error('Failed to fetch destinations: ', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load destinations.');
        }
    }

    public function store(Request $request)
    {
        try {
            $company = Auth::guard('company')->user();
            $company->id;

            $validated = $request->validate([
                'title' => 'required|string|max:255|min:3',
                'description' => 'required|string|min:10|max:5000',
                'location' => 'required|string|max:255',
                'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'required|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0|lt:price',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_featured' => 'boolean',
                'is_active' => 'boolean',
            ]);

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $validated['image'] = $request->file('image')->store('destinations', 'public');
            } else {
                throw ValidationException::withMessages(['image' => 'Invalid or missing image file']);
            }

            $validated['company_id'] = $company->id;
            $validated['is_active'] = $request->boolean('is_active', true);
            $validated['is_featured'] = $request->boolean('is_featured', false);

            Destination::create($validated);

            return redirect()->back()->with('success', 'Destination created successfully!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to create destination: ' . $e->getMessage());
            return back()->with('error', 'Failed to create destination.');
        }
    }

    public function update(Request $request, Destination $destination)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($destination->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            // Debug logging
            Log::info('Update request received for destination ID: ' . $destination->id);
            Log::info('Request data:', $request->all());
            Log::info('Request files:', $request->allFiles());

            // Modified validation - removed 'sometimes' and made fields required
            $validated = $request->validate([
                'title' => 'required|string|max:255|min:3',
                'description' => 'required|string|min:10|max:5000',
                'location' => 'required|string|max:255',
                'category' => 'required|in:Beach,Mountain,City,Cultural,Adventure,Historical,Wildlife',
                'price' => 'required|numeric|min:0.01',
                'discount_price' => 'nullable|numeric|min:0|lt:price',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'rating' => 'nullable|numeric|min:0|max:5',
                'is_featured' => 'required|boolean',
                'is_active' => 'required|boolean',
            ]);

            Log::info('Validated data:', $validated);

            // Handle image upload
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                // Delete old image
                if ($destination->image) {
                    Storage::disk('public')->delete($destination->image);
                }
                $validated['image'] = $request->file('image')->store('destinations', 'public');
            } else {
                // Remove image from validated data if not provided
                unset($validated['image']);
            }

            // Explicitly handle boolean conversions
            $validated['is_featured'] = $request->input('is_featured') === '1' || $request->input('is_featured') === true;
            $validated['is_active'] = $request->input('is_active') === '1' || $request->input('is_active') === true;

            Log::info('Final data to update:', $validated);

            // Update the destination
            $updated = $destination->update($validated);

            Log::info('Update result:', ['success' => $updated]);

            // Verify the update
            $destination->refresh();
            Log::info('Destination after update:', $destination->toArray());

            return redirect()->back()->with('success', 'Destination updated successfully!');
        } catch (ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed.');
        } catch (\Exception $e) {
            Log::error('Failed to update destination ID ' . $destination->id . ': ' . $e->getMessage());
            Log::error('Exception details:', [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Failed to update destination: ' . $e->getMessage());
        }
    }

    public function destroy(Destination $destination)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($destination->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            if ($destination->image) {
                Storage::disk('public')->delete($destination->image);
            }
            $destination->delete();

            return redirect()->back()->with('success', 'Destination deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete destination ID ' . $destination->id . ': ' . $e->getMessage());
            return back()->with('error', 'Failed to delete destination.');
        }
    }

    public function toggleFeatured(Destination $destination)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($destination->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $destination->is_featured = !$destination->is_featured;
            $destination->save();

            $message = $destination->is_featured ? 'Destination set as featured.' : 'Destination removed from featured.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle featured status for destination ID ' . $destination->id . ': ' . $e->getMessage());
            return back()->with('error', 'Failed to toggle featured status.');
        }
    }

    public function toggleActive(Destination $destination)
    {
        try {
            $company = Auth::guard('company')->user();
            if ($destination->company_id !== $company->id) {
                return back()->with('error', 'Unauthorized action.');
            }

            $destination->is_active = !$destination->is_active;
            $destination->save();

            $message = $destination->is_active ? 'Destination activated.' : 'Destination deactivated.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to toggle active status for destination ID ' . $destination->id . ': ' . $e->getMessage());
            return back()->with('error', 'Failed to toggle active status.');
        }
    }
}
