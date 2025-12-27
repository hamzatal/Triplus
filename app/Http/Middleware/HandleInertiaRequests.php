<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => Auth::guard('web')->check() ? [
                    'id' => Auth::guard('web')->user()->id,
                    'name' => Auth::guard('web')->user()->name,
                    'email' => Auth::guard('web')->user()->email,
                ] : null,
                'admin' => Auth::guard('admin')->check() ? [
                    'id' => Auth::guard('admin')->user()->id,
                    'name' => Auth::guard('admin')->user()->name,
                    'email' => Auth::guard('admin')->user()->email,
                ] : null,
                'company' => Auth::guard('company')->check() ? [
                    'id' => Auth::guard('company')->user()->id,
                    'name' => Auth::guard('company')->user()->name,
                    'email' => Auth::guard('company')->user()->email,
                    'company_name' => Auth::guard('company')->user()->company_name,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'errors' => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->getMessages()
                : [],
        ]);
    }
}
