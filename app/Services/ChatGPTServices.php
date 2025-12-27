<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class ChatGPTServices
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->client = new Client([
            'verify' => env('APP_ENV') === 'production' ? true : false,
        ]);
        $this->apiKey = env('OPENAI_API_KEY');

        if (empty($this->apiKey)) {
            Log::error('OpenAI API key is missing in configuration.');
            throw new \Exception('OpenAI API key is not configured or is empty.');
        }
    }

    /**
     * Handle user message with intelligent travel-focused responses
     *
     * @param string $message
     * @return array
     */
    public function handleUserMessage(string $message): array
    {
        try {
            $language = $this->detectLanguage($message);
            $queryType = $this->analyzeQueryType($message);
            $prompt = $this->buildIntelligentPrompt($message, $queryType, $language);

            $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $this->getAdvancedSystemPrompt($language, $queryType),
                        ],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 1800,
                    'temperature' => 0.7,
                ],
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            return [
                'status' => 'success',
                'response' => $body['choices'][0]['message']['content'] ?? 'No response from AI.',
                'language' => $language,
                'query_type' => $queryType,
            ];
        } catch (RequestException $e) {
            Log::error('Failed to connect to ChatGPT API: ' . $e->getMessage(), [
                'request' => $e->getRequest()->getBody()->getContents(),
                'response' => $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null,
            ]);
            return [
                'status' => 'error',
                'message' => $this->getErrorMessage($language, 'api_error'),
                'error' => $e->getMessage(),
            ];
        } catch (\Exception $e) {
            Log::error('Unexpected error in ChatGPTService: ' . $e->getMessage(), [
                'message' => $message,
                'trace' => $e->getTraceAsString(),
            ]);
            return [
                'status' => 'error',
                'message' => $this->getErrorMessage($language, 'general_error'),
                'error' => $e->getMessage(),
            ];
        }
    }

    private function analyzeQueryType(string $message): string
    {
        $message = strtolower($message);

        // Budget-related queries
        if (preg_match('/\b(budget|cheap|affordable|cost|price|money|expensive|ميزانية|رخيص|تكلفة|سعر|مال)\b/i', $message)) {
            return 'budget';
        }

        // Destination queries
        if (preg_match('/\b(where|destination|place|country|city|visit|travel to|وجهة|مكان|دولة|مدينة|زيارة|السفر إلى)\b/i', $message)) {
            return 'destination';
        }

        // Time/season queries
        if (preg_match('/\b(when|time|season|weather|month|best time|وقت|موسم|طقس|شهر|أفضل وقت)\b/i', $message)) {
            return 'timing';
        }

        // Activity queries
        if (preg_match('/\b(activity|activities|things to do|attractions|sightseeing|أنشطة|أشياء للقيام|معالم|جولات)\b/i', $message)) {
            return 'activities';
        }

        // Accommodation queries
        if (preg_match('/\b(hotel|accommodation|stay|resort|booking|فندق|إقامة|منتجع|حجز)\b/i', $message)) {
            return 'accommodation';
        }

        // Transportation queries
        if (preg_match('/\b(flight|transport|car|bus|train|taxi|طيران|نقل|سيارة|حافلة|قطار|تاكسي)\b/i', $message)) {
            return 'transportation';
        }

        // General help
        if (preg_match('/\b(help|assist|guide|plan|مساعدة|دليل|خطة)\b/i', $message)) {
            return 'help';
        }

        return 'general';
    }

    private function getAdvancedSystemPrompt(string $language, string $queryType): string
    {
        $basePrompt = "You are Triplus AI, a professional travel planning expert with extensive knowledge of global destinations, travel logistics, and cultural insights.";

        if ($language === 'ar') {
            $basePrompt .= " Always respond in Arabic when the user writes in Arabic.";
        } else {
            $basePrompt .= " Always respond in English when the user writes in English.";
        }

        $basePrompt .= "\n\nQUERY TYPE: " . strtoupper($queryType) . "\n";

        switch ($queryType) {
            case 'budget':
                $basePrompt .= "Focus on cost-effective travel solutions, budget breakdowns, money-saving tips, and affordable alternatives.";
                break;
            case 'destination':
                $basePrompt .= "Provide detailed destination recommendations with unique selling points, cultural highlights, and practical travel information.";
                break;
            case 'timing':
                $basePrompt .= "Focus on optimal travel timing, weather patterns, seasonal considerations, and event calendars.";
                break;
            case 'activities':
                $basePrompt .= "Emphasize attractions, activities, experiences, and local entertainment options with practical booking information.";
                break;
            case 'accommodation':
                $basePrompt .= "Provide detailed accommodation recommendations across different price ranges with booking tips and location advantages.";
                break;
            case 'transportation':
                $basePrompt .= "Focus on transportation options, routes, booking strategies, and logistics for efficient travel.";
                break;
            case 'help':
                $basePrompt .= "Provide comprehensive travel planning guidance and explain how you can assist with various travel needs.";
                break;
            default:
                $basePrompt .= "Provide comprehensive travel planning assistance covering all relevant aspects.";
        }

        $basePrompt .= "

RESPONSE STRUCTURE:
- Use '===SECTION===' as delimiter between sections
- Format in Markdown for readability
- Include relevant sections based on query type

AVAILABLE SECTIONS:
1. **Quick Answer**: Direct response to the specific question
2. **Destination Highlights**: Key attractions and unique features
3. **Detailed Itinerary**: Day-by-day planning (when relevant)
4. **Budget Breakdown**: Realistic cost estimates with ranges
5. **Best Time to Visit**: Seasonal recommendations and considerations
6. **Accommodation Options**: Various price ranges and locations
7. **Transportation Guide**: Getting there and getting around
8. **Local Insights**: Cultural tips, food, customs, safety
9. **Booking Tips**: Practical advice for reservations and planning
10. **Alternative Options**: Additional suggestions and variations

RESPONSE GUIDELINES:
- Be specific and actionable
- Include realistic prices in USD (and local currency when relevant)
- Mention specific businesses, attractions, or services when helpful
- Provide multiple options across different budgets
- Include practical booking and planning advice
- Use professional yet friendly tone
- If information is incomplete, make reasonable assumptions and state them
- Always include the '===SECTION===' delimiter between sections";

        return $basePrompt;
    }

    private function buildIntelligentPrompt(string $message, string $queryType, string $language): string
    {
        $contextualPrompt = "User Query: \"$message\"\n";
        $contextualPrompt .= "Query Type: " . ucfirst($queryType) . "\n";
        $contextualPrompt .= "Language: " . ($language === 'ar' ? 'Arabic' : 'English') . "\n\n";

        switch ($queryType) {
            case 'budget':
                $contextualPrompt .= "Provide a comprehensive budget-focused response including cost breakdowns, money-saving strategies, and affordable alternatives. Include specific price ranges and practical tips for budget travel.";
                break;
            case 'destination':
                $contextualPrompt .= "Recommend destinations based on the user's preferences. Include detailed information about each destination's unique features, attractions, and practical travel information.";
                break;
            case 'timing':
                $contextualPrompt .= "Focus on the best times to travel, considering weather, crowds, prices, and special events. Provide month-by-month guidance when relevant.";
                break;
            case 'activities':
                $contextualPrompt .= "Highlight top activities, attractions, and experiences. Include practical information about booking, timing, and costs for each activity.";
                break;
            case 'accommodation':
                $contextualPrompt .= "Provide accommodation recommendations across different price ranges. Include specific hotel suggestions, booking tips, and location advantages.";
                break;
            case 'transportation':
                $contextualPrompt .= "Focus on transportation options, routes, and logistics. Include booking strategies, cost comparisons, and practical travel tips.";
                break;
            case 'help':
                $contextualPrompt .= "Explain your capabilities as a travel planning assistant and provide guidance on how to get the most helpful travel advice.";
                break;
            default:
                $contextualPrompt .= "Provide comprehensive travel planning assistance covering all relevant aspects of the user's inquiry.";
        }

        $contextualPrompt .= "\n\nEnsure your response is well-structured with clear sections separated by '===SECTION==='. Make your advice practical, specific, and actionable.";

        return $contextualPrompt;
    }

    private function detectLanguage(string $message): string
    {
        // Enhanced Arabic detection with more comprehensive patterns
        if (
            preg_match('/[ء-ي]/u', $message) ||
            preg_match('/\b(في|من|إلى|على|مع|هذا|هذه|ذلك|تلك|أين|متى|كيف|ماذا|لماذا)\b/u', $message)
        ) {
            return 'ar';
        }
        return 'en';
    }

    private function getErrorMessage(string $language, string $errorType): string
    {
        $messages = [
            'ar' => [
                'api_error' => 'عذراً، حدث خطأ في الاتصال بالخدمة. يرجى المحاولة مرة أخرى.',
                'general_error' => 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
            ],
            'en' => [
                'api_error' => 'Sorry, there was a connection error. Please try again.',
                'general_error' => 'Sorry, an unexpected error occurred. Please try again.',
            ]
        ];

        return $messages[$language][$errorType] ?? $messages['en'][$errorType];
    }
}
