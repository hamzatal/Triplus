<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RestrictBooking
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::guard('company')->check()) {
            return redirect()->route('company.dashboard')->with('error', 'Companies cannot make bookings.');
        }

        return $next($request);
    }
}
