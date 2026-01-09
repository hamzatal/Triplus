<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\DeactivateAccountRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $user->avatar_url = $user->avatar ? Storage::url($user->avatar) : null;

        return response()->json([
            'user' => $user,
            'status' => 'success',
        ]);
    }

    public function update(ProfileUpdateRequest $request)
    {
        try {
            $user = $request->user();

            Log::info('Profile update request:', [
                'files' => $request->hasFile('avatar') ? $request->file('avatar')->getClientOriginalName() : 'No file',
                'data' => $request->except('avatar'),
            ]);

            $validated = $request->validated();
            $user->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'bio' => $validated['bio'] ?? null,
                'phone' => $validated['phone'] ?? null,
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
                if ($user instanceof MustVerifyEmail) {
                    $user->sendEmailVerificationNotification();
                }
            }

            if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
                Log::info('Avatar file detected:', [
                    'name' => $request->file('avatar')->getClientOriginalName(),
                    'size' => $request->file('avatar')->getSize(),
                    'mime' => $request->file('avatar')->getMimeType(),
                ]);

                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                    Log::info('Deleted old avatar:', ['path' => $user->avatar]);
                }

                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $avatarPath;
                Log::info('New avatar stored:', ['path' => $avatarPath]);
            }

            $user->save();
            // Refresh avatar cache
            if ($request->hasFile('avatar')) {
                $user->avatar_url = Storage::url($user->avatar);
                // Clear any cache
                cache()->forget("user_{$user->id}");
            }

            Log::info('User updated:', [
                'id' => $user->id,
                'avatar' => $user->avatar,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'phone' => $user->phone,
            ]);

            $user->avatar_url = $user->avatar ? Storage::url($user->avatar) : null;
            return response()->json([
                'user' => $user,
                'status' => 'Profile updated successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updatePassword(PasswordUpdateRequest $request)
    {
        $request->user()->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return response()->json([
            'status' => 'Password updated successfully.',
        ]);
    }

    public function deactivate(DeactivateAccountRequest $request)
    {
        Log::info('Deactivate account request:', $request->all());

        $user = $request->user();

        if ($request->validated()['deactivation_reason']) {
            $user->deactivation_reason = $request->validated()['deactivation_reason'];
        }

        $user->is_active = false;
        $user->deactivated_at = Carbon::now();
        $user->save();

        Log::info('Account deactivated:', ['user_id' => $user->id]);

        Auth::logout();

        return response()->json([
            'status' => 'Your account has been deactivated.',
            'redirect' => '/about-us',
        ]);
    }
}
