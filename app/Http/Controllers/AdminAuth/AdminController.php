<?php

namespace App\Http\Controllers\AdminAuth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Contact;
use App\Models\Company;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::select('id', 'name', 'email', 'is_active', 'created_at')
                ->latest();

            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($status = $request->input('status')) {
                $query->where('is_active', $status === 'active' ? 1 : 0);
            }

            $users = $query->paginate(10)->withQueryString();

            return Inertia::render('Admin/Users', [
                'users' => $users,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch users:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load users.');
        }
    }

    public function toggleUserStatus(Request $request, $id)
    {
        try {
            $admin = Auth::guard('admin')->user();
            $isAdmin = Admin::where('id', $id)->exists();
            if ($isAdmin && $id == $admin->id) {
                return back()->with('error', 'You cannot deactivate your own admin account.');
            }

            $user = User::findOrFail($id);
            $user->is_active = !$user->is_active;
            $user->deactivated_at = $user->is_active ? null : now();
            $user->deactivation_reason = $user->is_active ? null : 'Deactivated by admin';
            $user->save();

            if (!$user->is_active) {
                \Illuminate\Support\Facades\DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->delete();
            }

            $status = $user->is_active ? 'activated' : 'deactivated';
            Log::info("User {$user->id} $status by admin {$admin->id}");
            return redirect()->route('admin.users.index')->with('success', "User $status successfully");
        } catch (\Exception $e) {
            Log::error('Failed to toggle user status:', ['user_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to toggle user status.');
        }
    }

    public function showContacts(Request $request)
    {
        try {
            $query = Contact::select('id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read')
                ->orderBy('created_at', 'desc');

            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            $messages = $query->paginate(10)->withQueryString();

            return Inertia::render('Admin/ContactsView', [
                'messages' => $messages,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch contacts:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load contacts.');
        }
    }

    public function markAsRead($id)
    {
        try {
            $contact = Contact::findOrFail($id);
            $contact->is_read = true;
            $contact->save();

            Log::info("Message {$id} marked as read by admin " . Auth::guard('admin')->id());
            return redirect()->route('admin.contacts')->with('success', 'Message marked as read successfully');
        } catch (\Exception $e) {
            Log::error('Failed to mark message as read:', ['contact_id' => $id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to mark message as read.');
        }
    }

    public function getAdminProfile()
    {
        try {
            $admin = Auth::guard('admin')->user();

            return Inertia::render('Admin/Profile', [
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'last_login' => $admin->last_login,
                    'avatar' => $admin->avatar ? Storage::url($admin->avatar) : null,
                    'created_at' => $admin->created_at,
                    'updated_at' => $admin->updated_at,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch admin profile:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load profile.');
        }
    }

    public function updateAdminProfile(Request $request)
    {
        try {
            $admin = Auth::guard('admin')->user();

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
                'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            ]);

            if ($request->hasFile('avatar')) {
                if ($admin->avatar) {
                    Storage::disk('public')->delete($admin->avatar);
                }
                $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
            } else {
                unset($validated['avatar']);
            }

            $admin->update($validated);

            Log::info("Admin {$admin->id} updated profile", ['admin_id' => $admin->id]);
            return redirect()->route('admin.profile')->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update admin profile:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update profile.');
        }
    }

    public function updateAdminPassword(Request $request)
    {
        try {
            $admin = Auth::guard('admin')->user();

            $validated = $request->validate([
                'current_password' => ['required', function ($attribute, $value, $fail) use ($admin) {
                    if (!Hash::check($value, $admin->password)) {
                        $fail('The current password is incorrect.');
                    }
                }],
                'new_password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $admin->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            Log::info("Admin {$admin->id} updated password", ['admin_id' => $admin->id]);
            return redirect()->route('admin.profile')->with('success', 'Password updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update admin password:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update password.');
        }
    }
}
