<?php

namespace App\Http\Controllers;

use App\Services\ChatGPTServices;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatBotController extends Controller
{
    protected $chatGPTService;

    public function __construct(ChatGPTServices $chatGPTService)
    {
        $this->chatGPTService = $chatGPTService;
    }

    public function handleChat(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:2000',
            ]);

            $message = $request->input('message');
            $response = $this->chatGPTService->handleUserMessage($message);

            if ($response['status'] === 'error') {
                Log::error('ChatBotController error: ' . $response['message'], [
                    'error' => $response['error'] ?? 'No additional error info',
                    'message' => $message,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => $response['message'],
                    'error' => $response['error'] ?? 'Unknown error',
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'response' => $response['response'],
                'language' => $response['language'] ?? 'en',
            ], 200);
        } catch (\Exception $e) {
            Log::error('ChatBotController exception: ' . $e->getMessage(), [
                'message' => $request->input('message', 'N/A'),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
