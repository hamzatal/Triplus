<?php

namespace App\Http\Controllers\CompanyAuth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    /**
     * Handle company login.
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required'],
            ]);

            if (Auth::guard('company')->attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();
                $company = Auth::guard('company')->user();
                Log::info('Company logged in:', ['company_id' => $company->id]);
                return redirect()->intended(route('company.dashboard'))->with('success', 'Logged in successfully.');
            }

            Log::warning('Company login failed:', ['email' => $request->email]);
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->with('error', 'Invalid login credentials.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Company login validation failed:', ['errors' => $e->errors()]);
            return back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed. Please check your input.');
        } catch (\Exception $e) {
            Log::error('Company login error:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to login. Please try again later.');
        }
    }

    /**
     * Handle company logout.
     */
    public function logout(Request $request)
    {
        try {
            $companyId = Auth::guard('company')->id();
            Auth::guard('company')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            Log::info('Company logged out:', ['company_id' => $companyId]);
            return redirect()->route('login')->with('success', 'Logged out successfully.');
        } catch (\Exception $e) {
            Log::error('Company logout error:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to logout. Please try again later.');
        }
    }

    /**
     * Display the company profile page.
     */
    public function profile()
    {
        try {
            $company = Auth::guard('company')->user();
            $logo_url = null;
            if ($company->company_logo && Storage::disk('public')->exists($company->company_logo)) {
                $logo_url = Storage::url($company->company_logo);
            }

            return Inertia::render('Company/Profile', [
                'company' => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'company_name' => $company->company_name,
                    'license_number' => $company->license_number,
                    'email' => $company->email,
                    'company_logo_url' => $logo_url, // Pass the logo URL
                    // Add other fields like 'last_login', 'created_at' if needed by the frontend
                ],
                // Flash messages (success, error) are automatically passed by Inertia's ShareInertiaData middleware
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch company profile:', ['error' => $e->getMessage()]);
            // It's often better to redirect to a safe page like dashboard with an error
            return redirect()->route('company.dashboard')->with('error', 'Failed to load profile.');
        }
    }

    /**
     * Update the company's profile information.
     */
    public function updateProfile(Request $request)
    {
        $company = Auth::guard('company')->user();
        try {
            // Validate the request data
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'company_name' => ['required', 'string', 'max:255'],
                'license_number' => ['required', 'string', 'max:255', Rule::unique('companies')->ignore($company->id)],
                'email' => ['required', 'email', 'max:255', Rule::unique('companies')->ignore($company->id)],
                'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // 'logo' is the name of the file input from the form
            ]);

            $updatePayload = [
                'name' => $validatedData['name'],
                'company_name' => $validatedData['company_name'],
                'license_number' => $validatedData['license_number'],
                'email' => $validatedData['email'],
            ];

            // Handle file upload for 'company_logo'
            if ($request->hasFile('logo')) {
                $logoFieldInDb = 'company_logo'; // The column name in your 'companies' table

                // Delete old logo if it exists
                if ($company->$logoFieldInDb && Storage::disk('public')->exists($company->$logoFieldInDb)) {
                    Storage::disk('public')->delete($company->$logoFieldInDb);
                }
                // Store new logo and get its path
                // Store in 'public/company_logos' directory
                $path = $request->file('logo')->store('company_logos', 'public');
                $updatePayload[$logoFieldInDb] = $path;
            }

            $company->update($updatePayload);

            Log::info('Company profile updated:', ['company_id' => $company->id]);
            return redirect()->route('company.profile')->with('success', 'Profile updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Company profile update validation failed:', ['company_id' => $company->id, 'errors' => $e->errors()]);
            // Redirect back with validation errors and input, also set a general error flash message
            return back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed. Please check your input.');
        } catch (\Exception $e) {
            Log::error('Failed to update company profile:', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString() // Log more details for debugging
            ]);
            return back()->with('error', 'Failed to update profile. An unexpected error occurred.');
        }
    }

    /**
     * Update the company's password.
     */
    public function updatePassword(Request $request)
    {
        $company = Auth::guard('company')->user();
        try {
            $request->validate([
                'current_password' => ['required', 'string'],
                'new_password' => ['required', 'string', 'min:8', 'confirmed'], // 'confirmed' checks for 'new_password_confirmation'
            ]);

            if (!Hash::check($request->current_password, $company->password)) {
                return back()->withErrors(['current_password' => 'Current password is incorrect.'])->with('error', 'Password update failed.');
            }

            $company->password = Hash::make($request->new_password);
            $company->save();

            Log::info('Company password updated:', ['company_id' => $company->id]);
            return redirect()->route('company.profile')->with('success', 'Password updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Company password update validation failed:', ['company_id' => $company->id, 'errors' => $e->errors()]);
            return back()->withErrors($e->errors())->withInput()->with('error', 'Validation failed. Please check your input.');
        } catch (\Exception $e) {
            Log::error('Failed to update company password:', ['company_id' => $company->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update password. An unexpected error occurred.');
        }
    }
}
