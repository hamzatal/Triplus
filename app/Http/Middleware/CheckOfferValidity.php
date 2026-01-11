<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Offer;
use Carbon\Carbon;

class CheckOfferValidity
{
    public function handle(Request $request, Closure $next)
    {
        $offerId = $request->input('offer_id') ?? $request->route('offer_id');

        if ($offerId) {
            $offer = Offer::find($offerId);

            if (!$offer) {
                return redirect()->route('offers.index')
                    ->with('error', 'Offer not found');
            }

            // التحقق من أن العرض لم ينتهِ
            if ($offer->end_date && Carbon::parse($offer->end_date)->lt(Carbon::today())) {
                return redirect()->route('offers.index')
                    ->with('error', 'This offer has expired and is no longer available for booking');
            }

            // التحقق من أن العرض نشط
            if (!$offer->is_active) {
                return redirect()->route('offers.index')
                    ->with('error', 'This offer is currently not available');
            }
        }

        return $next($request);
    }
}
