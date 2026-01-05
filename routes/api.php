<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\Api\HeroFallbackController;


Route::post('/chatbot', [ChatBotController::class, 'chat']);

/*
|----------------------------------------------------------------------
| API Routes
|----------------------------------------------------------------------
*/


// Hero Fallback Route        
Route::get('/hero/fallback', [HeroFallbackController::class, 'index']);


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Contacts Routes
Route::get('contacts', [ContactController::class, 'index']);
Route::get('contacts/{contact}', [ContactController::class, 'show']);
Route::post('contacts', [ContactController::class, 'store']);
Route::delete('contacts/{contact}', [ContactController::class, 'destroy']);


// Users Routes
Route::get('users', [UserController::class, 'index']);
Route::get('users/{user}', [UserController::class, 'show']);
Route::delete('users/{user}', [UserController::class, 'destroy']);

