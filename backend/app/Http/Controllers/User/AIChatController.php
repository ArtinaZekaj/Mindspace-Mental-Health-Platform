<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use GuzzleHttp\Client;

class AIChatController extends Controller
{
    public function chat(Request $request)
    {
        $userMessage = $request->input('message');
        $name = Auth::user()->name ?? "friend";

        try {
            $client = new Client();

            $response = $client->post(
                'https://router.huggingface.co/v1/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . env('HUGGINGFACE_API_KEY'),
                        'Content-Type'  => 'application/json',
                    ],
                    'json' => [
                        'model' => 'meta-llama/Llama-3.2-1B-Instruct',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' =>
                                    "You are MindSpace AI — a warm, emotionally supportive companion.
                                    Your tone must ALWAYS be:
                                    - empathetic
                                    - calming
                                    - validating
                                    - caring
                                    - gentle and human

                                    Never give medical advice or crisis instructions.
                                    Keep replies short, warm, nurturing, and emotionally safe."
                            ],
                            [
                                'role' => 'user',
                                'content' =>
                                    "{$name} says: {$userMessage}. Respond supportively."
                            ]
                        ],
                        'max_tokens' => 200,
                    ],
                ]
            );

            $result = json_decode($response->getBody(), true);

            $reply =
                $result['choices'][0]['message']['content']
                ?? "I'm here with you 💙 Tell me more.";

            return response()->json([
                'reply' => $reply
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'reply' => "I'm here with you 💙 (AI is temporarily unavailable)"
            ], 503);
        }
    }
}
