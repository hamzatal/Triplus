<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'avatar' => $admin->image ? Storage::url($admin->image) : null,
            'last_login' => $admin->last_login,
        ]);
    }

    public function update(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:admins,email,' . $admin->id,
            'currentPassword' => 'nullable|string|required_with:newPassword',
            'newPassword' => 'nullable|string|min:8|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $admin->name = $validated['name'];
        $admin->email = $validated['email'];

        if ($request->filled('currentPassword') && $request->filled('newPassword')) {
            if (!Hash::check($request->currentPassword, $admin->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 422);
            }
            $admin->password = Hash::make($validated['newPassword']);
        }

        if ($request->hasFile('avatar')) {
            if ($admin->image) {
                Storage::delete($admin->image);
            }
            $path = $request->file('avatar')->store('admin_images', 'public');
            $admin->image = $path;
        }

        $admin->save();

        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'avatar' => $admin->image ? Storage::url($admin->image) : null,
            'last_login' => $admin->last_login,
            'message' => 'Profile updated successfully',
        ]);
    }
}