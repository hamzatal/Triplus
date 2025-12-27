<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        try {
            $users = User::select([
                'id',
                'name',
                'email',
                'bio',
                'phone',
                'avatar',
                'is_active',
                'deactivated_at',
                'deactivation_reason',
                'created_at',
                'updated_at',
            ])->get()->map(function ($user) {
                $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;
                return $user;
            });

            return response()->json([
                'message' => 'Users retrieved successfully.',
                'data' => $users,
            ], 200);
        } catch (Exception $e) {
            Log::error('Failed to retrieve users:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred while retrieving users.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single user by ID
     */
    public function show($id)
    {
        try {
            $user = User::select([
                'id',
                'name',
                'email',
                'bio',
                'phone',
                'avatar',
                'is_active',
                'deactivated_at',
                'deactivation_reason',
                'created_at',
                'updated_at',
            ])->find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;

            return response()->json([
                'message' => 'User retrieved successfully.',
                'data' => $user,
            ], 200);
        } catch (Exception $e) {
            Log::error('Failed to retrieve user:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred while retrieving the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a user by ID
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255|unique:users,email,' . $id,
                'bio' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:20',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'nullable|boolean',
            ]);

            $data = [
                'name' => $validated['name'] ?? $user->name,
                'email' => $validated['email'] ?? $user->email,
                'bio' => $validated['bio'] ?? $user->bio,
                'phone' => $validated['phone'] ?? $user->phone,
                'is_active' => isset($validated['is_active']) ? $validated['is_active'] : $user->is_active,
            ];

            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $user->update($data);

            $user->avatar = $user->avatar ? Storage::url($user->avatar) : null;

            return response()->json([
                'message' => 'User updated successfully.',
                'data' => $user,
            ], 200);
        } catch (ValidationException $e) {
            Log::error('Update user validation failed:', ['id' => $id, 'errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Failed to update user:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred while updating the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a user by ID
     */
    public function destroy($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully.'], 200);
        } catch (Exception $e) {
            Log::error('Failed to delete user:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred while deleting the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
