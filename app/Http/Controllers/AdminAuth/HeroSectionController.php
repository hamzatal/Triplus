<?php

namespace App\Http\Controllers\AdminAuth;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HeroSectionController extends Controller
{
    public function index()
    {
        $heroSections = HeroSection::all();
        return inertia('Admin/Hero/AdminHero', [
            'heroSections' => $heroSections,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|min:3|max:255',
                'subtitle' => 'required|string|min:3|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            Log::debug('Store hero section validated:', ['data' => $validated]);

            $imageName = time() . '.' . $request->image->extension();
            $request->image->storeAs('hero', $imageName, 'public');

            $hero = HeroSection::create([
                'title' => $validated['title'],
                'subtitle' => $validated['subtitle'],
                'image' => 'hero/' . $imageName,
                'is_active' => true,
            ]);

            Log::debug('Hero section created:', ['id' => $hero->id]);

            return redirect()->route('admin.hero.index')->with('success', 'Hero section added successfully.');
        } catch (ValidationException $e) {
            Log::error('Store hero section validation failed:', ['errors' => $e->errors()]);
            return back()->withErrors($e->errors())->with('error', 'Failed to create hero section.');
        } catch (\Exception $e) {
            Log::error('Store hero section failed:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create hero section.');
        }
    }

    public function update(Request $request, $id)
    {
        Log::debug('Update hero section request:', [
            'id' => $id,
            'data' => $request->except('image'),
            'has_file' => $request->hasFile('image'),
            'files' => $request->allFiles(),
            'headers' => $request->headers->all(),
        ]);

        try {
            $hero = HeroSection::findOrFail($id);

            Log::debug('Hero section before update:', ['attributes' => $hero->getAttributes()]);

            $validated = $request->validate([
                'title' => 'nullable|string|min:3|max:255',
                'subtitle' => 'nullable|string|min:3|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            Log::debug('Update hero section validated:', ['data' => $validated]);

            $data = [
                'title' => $validated['title'] ?? $hero->title,
                'subtitle' => $validated['subtitle'] ?? $hero->subtitle,
                'image' => $hero->image ?? '',
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                Log::debug('New image detected:', [
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getMimeType(),
                ]);

                // Delete old image if exists
                if ($hero->image) {
                    Storage::disk('public')->delete($hero->image);
                    Log::debug('Old image deleted:', ['old_path' => $hero->image]);
                }

                // Store new image
                $imageName = time() . '.' . $file->extension();
                $file->storeAs('hero', $imageName, 'public');
                $data['image'] = 'hero/' . $imageName;

                Log::debug('New image stored:', ['new_path' => $data['image']]);
            } else {
                Log::debug('No new image provided, retaining existing image:', ['image' => $data['image']]);
            }

            // Enable query logging
            DB::enableQueryLog();

            // Update using mass assignment
            $updated = $hero->update($data);

            $queries = DB::getQueryLog();
            DB::disableQueryLog();

            Log::debug('Hero section update result:', [
                'id' => $hero->id,
                'updated' => $updated,
                'data' => $data,
                'attributes_after' => $hero->fresh()->getAttributes(),
                'queries' => $queries,
            ]);

            if (!$updated) {
                Log::error('Hero section update failed: No changes applied', [
                    'id' => $id,
                    'data' => $data,
                ]);
                return back()->with('error', 'Failed to update hero section: No changes applied.');
            }

            return redirect()->route('admin.hero.index')->with('success', 'Hero section updated successfully.');
        } catch (ValidationException $e) {
            Log::error('Update hero section validation failed:', [
                'id' => $id,
                'errors' => $e->errors(),
            ]);
            return back()->withErrors($e->errors())->with('error', 'Failed to update hero section.');
        } catch (\Exception $e) {
            Log::error('Update hero section failed:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Failed to update hero section: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $hero = HeroSection::findOrFail($id);
            if ($hero->image) {
                Storage::disk('public')->delete($hero->image);
            }
            $hero->delete();

            Log::debug('Hero section deleted:', ['id' => $id]);

            return redirect()->route('admin.hero.index')->with('success', 'Hero section deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Delete hero section failed:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete hero section.');
        }
    }

    public function toggleActive(Request $request, $id)
    {
        try {
            $hero = HeroSection::findOrFail($id);
            $hero->is_active = !$hero->is_active;
            $hero->save();

            Log::debug('Hero section active status toggled:', [
                'id' => $id,
                'is_active' => $hero->is_active,
            ]);

            $message = $hero->is_active ? 'Hero section activated successfully.' : 'Hero section deactivated successfully.';
            return redirect()->route('admin.hero.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Toggle hero section active status failed:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update active status.');
        }
    }
}
