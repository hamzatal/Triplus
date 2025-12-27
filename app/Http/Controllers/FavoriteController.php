<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    /**
     * Store a newly created favorite or remove an existing one (toggle).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Check authentication
        if (!Auth::guard('web')->check()) {
            return response()->json(['success' => false, 'message' => 'You must be logged in to manage favorites.'], 401);
        }

        try {
            // Validate input
            $validated = $request->validate([
                'destination_id' => 'nullable|integer|exists:destinations,id',
                'package_id' => 'nullable|integer|exists:packages,id',
                'offer_id' => 'nullable|integer|exists:offers,id',
            ]);

            // Determine item ID and type
            $itemId = null;
            $itemType = null;
            if (!empty($validated['destination_id'])) {
                $itemId = $validated['destination_id'];
                $itemType = 'destination_id';
            } elseif (!empty($validated['package_id'])) {
                $itemId = $validated['package_id'];
                $itemType = 'package_id';
            } elseif (!empty($validated['offer_id'])) {
                $itemId = $validated['offer_id'];
                $itemType = 'offer_id';
            }

            $userId = Auth::guard('web')->id();

            // Check for existing favorite
            $existing = Favorite::where('user_id', $userId)
                ->where($itemType, $itemId)
                ->first();

            if ($existing) {
                // Remove favorite
                $existing->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Removed from favorites!',
                    'is_favorite' => false,
                    'favorite_id' => null
                ]);
            }

            // Create favorite
            $favorite = Favorite::create([
                'user_id' => $userId,
                $itemType => $itemId,
                'destination_id' => ($itemType === 'destination_id') ? $itemId : null,
                'package_id' => ($itemType === 'package_id') ? $itemId : null,
                'offer_id' => ($itemType === 'offer_id') ? $itemId : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Added to favorites!',
                'is_favorite' => true,
                'favorite_id' => $favorite->id
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to manage favorite.'], 500);
        }
    }

    public function destroy($id)
    {
        if (!Auth::guard('web')->check()) {
            return response()->json(['success' => false, 'message' => 'You must be logged in to manage favorites.'], 401);
        }

        try {
            $favorite = Favorite::where('id', $id)
                ->where('user_id', Auth::guard('web')->id())
                ->firstOrFail();

            $favorite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Removed from favorites!',
                'is_favorite' => false,
                'favorite_id' => null
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Favorite not found or you do not have permission to remove it.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to remove favorite.'], 500);
        }
    }
}
