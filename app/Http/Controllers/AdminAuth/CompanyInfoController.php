<?php

namespace App\Http\Controllers\AdminAuth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Destination;
use App\Models\Offer;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CompanyInfoController extends Controller
{
    public function index()
    {
        try {
            $companies = Company::with([
                'destinations' => fn($query) => $query->select('id', 'company_id', 'title', 'location', 'category', 'price', 'is_active', 'created_at'),
                'offers' => fn($query) => $query->select('id', 'company_id', 'title', 'location', 'category', 'price', 'is_active', 'created_at'),
                'packages' => fn($query) => $query->select('id', 'company_id', 'title', 'location', 'category', 'price', 'is_active', 'created_at'),
            ])->select('id', 'company_name', 'email', 'license_number', 'is_active', 'created_at')
                ->get();

            Log::info('Company Info page loaded', ['admin_id' => auth()->guard('admin')->id()]);

            return Inertia::render('Admin/CompanyInfo', [
                'companies' => $companies,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load Company Info page', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to load companies.');
        }
    }

    public function toggleActive(Request $request, $id)
    {
        try {
            $company = Company::findOrFail($id);
            $company->is_active = !$company->is_active;
            $company->save();

            Log::info('Company active status toggled', [
                'company_id' => $id,
                'is_active' => $company->is_active,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Company status updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to toggle company status', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update company status.');
        }
    }

    public function destroy($id)
    {
        try {
            $company = Company::findOrFail($id);
            $company->delete();

            Log::info('Company deleted', [
                'company_id' => $id,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Company deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete company', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete company.');
        }
    }

    public function toggleDestinationActive(Request $request, $companyId, $id)
    {
        try {
            $destination = Destination::where('company_id', $companyId)->findOrFail($id);
            $destination->is_active = !$destination->is_active;
            $destination->save();

            Log::info('Destination active status toggled', [
                'destination_id' => $id,
                'company_id' => $companyId,
                'is_active' => $destination->is_active,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Destination status updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to toggle destination status', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update destination status.');
        }
    }

    public function destroyDestination($companyId, $id)
    {
        try {
            $destination = Destination::where('company_id', $companyId)->findOrFail($id);
            $destination->delete();

            Log::info('Destination deleted', [
                'destination_id' => $id,
                'company_id' => $companyId,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Destination deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete destination', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete destination.');
        }
    }

    public function toggleOfferActive(Request $request, $companyId, $id)
    {
        try {
            $offer = Offer::where('company_id', $companyId)->findOrFail($id);
            $offer->is_active = !$offer->is_active;
            $offer->save();

            Log::info('Offer active status toggled', [
                'offer_id' => $id,
                'company_id' => $companyId,
                'is_active' => $offer->is_active,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Offer status updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to toggle offer status', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update offer status.');
        }
    }

    public function destroyOffer($companyId, $id)
    {
        try {
            $offer = Offer::where('company_id', $companyId)->findOrFail($id);
            $offer->delete();

            Log::info('Offer deleted', [
                'offer_id' => $id,
                'company_id' => $companyId,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Offer deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete offer', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete offer.');
        }
    }

    public function togglePackageActive(Request $request, $companyId, $id)
    {
        try {
            $package = Package::where('company_id', $companyId)->findOrFail($id);
            $package->is_active = !$package->is_active;
            $package->save();

            Log::info('Package active status toggled', [
                'package_id' => $id,
                'company_id' => $companyId,
                'is_active' => $package->is_active,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Package status updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to toggle package status', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update package status.');
        }
    }

    public function destroyPackage($companyId, $id)
    {
        try {
            $package = Package::where('company_id', $companyId)->findOrFail($id);
            $package->delete();

            Log::info('Package deleted', [
                'package_id' => $id,
                'company_id' => $companyId,
                'admin_id' => auth()->guard('admin')->id(),
            ]);

            return redirect()->back()->with('success', 'Package deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete package', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete package.');
        }
    }
}
