<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Mood;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MoodController extends Controller
{
    public function index()
    {
        return Mood::where('user_id', Auth::id())->orderBy('date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'mood' => 'required|string',
            'note' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $mood = Mood::create([
            'user_id' => Auth::id(),
            'mood' => $request->mood,
            'note' => $request->note,
            'date' => $request->date,
        ]);

        return response()->json(['message' => 'Mood saved.', 'data' => $mood]);
    }

    public function update(Request $request, $id)
    {
        $mood = Mood::where('user_id', Auth::id())->findOrFail($id);
        $mood->update($request->only(['mood', 'note', 'date']));
        return response()->json(['message' => 'Mood updated.', 'data' => $mood]);
    }

    public function destroy($id)
    {
        $mood = Mood::where('user_id', Auth::id())->findOrFail($id);
        $mood->delete();
        return response()->json(['message' => 'Mood deleted.']);
    }

    //E shtojme kete funksion per me more psikologu top mood-in gjate javes per pacientet e vet
    public function moodsFromPatients()
    {
        $psychologistId = Auth::id();

        $patientIds = Appointment::where('psychologist_id', $psychologistId)
            ->pluck('user_id')
            ->unique()
            ->toArray();

        $moods = Mood::whereIn('user_id', $patientIds)->get();


        return response()->json($moods);
    }

    //AI EMOTIONAL SUGGESTIONS:
    public function aiSuggestion(Request $request)
    {
        try {
            $client = new \GuzzleHttp\Client();

            //  Merr mood-in nga frontend (prioritet)
            $userMood = $request->input('mood');

            //  Nëse frontend nuk dërgon mood (fallback), përdor mood-in e fundit
            if (!$userMood) {
                $lastMood = Mood::where('user_id', Auth::id())
                    ->orderBy('date', 'desc')
                    ->first();

                $userMood = $lastMood ? $lastMood->mood : "neutral";
            }

            //  Kërkesa drejtuar HuggingFace
            $response = $client->post(
                'https://router.huggingface.co/v1/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . env('HUGGINGFACE_API_KEY'),
                        'Content-Type'  => 'application/json',
                    ],
                    'body' => json_encode([
                        "model" => "meta-llama/Llama-3.2-1B-Instruct",
                        "messages" => [
                            [
                                "role" => "system",
                                "content" =>
                                "You are MindSpace AI - a warm, deeply empathetic emotional companion.
        Your purpose is to speak gently to the user's heart, offering emotional support
        that feels human, soft, and comforting.

        Your tone must ALWAYS be:
        - deeply humane
        - warm, emotionally intelligent
        - soothing, gentle, honest
        - validating and reassuring
        - non-judgmental
        - never robotic, never clinical
        - never giving medical advice or therapy

        You adapt your emotional style depending on the user's mood:

        ▸ Very Happy — celebrate their joy, amplify positivity, encourage gratitude and sharing.
        ▸ Happy — reinforce good energy, acknowledge positive momentum.
        ▸ Neutral — help them reflect calmly and gain clarity.
        ▸ Sad — respond with tenderness, comfort, compassion, and grounding reassurance.
        ▸ Very Sad — be extremely gentle, emotionally present, validating, warm.

        Your suggestions must feel like they come from a caring human friend,
        not a machine — they should touch the heart.

        You MUST return ONLY JSON:
        {
            \"summary\": \"...\",
            \"suggestions\": [
                { \"title\": \"..\", \"description\": \"..\", \"icon\": \"heart\" },
                { \"title\": \"..\", \"description\": \"..\", \"icon\": \"support\" },
                { \"title\": \"..\", \"description\": \"..\", \"icon\": \"movement\" }
            ]
        }
        No text outside JSON."
                            ],
                            [
                                "role" => "user",
                                "content" => "The user's current mood is: $userMood. Please generate the JSON response."
                            ]
                        ],
                        "max_tokens" => 300,
                    ]),
                ]
            );

            //  Parse rezultat
            $result = json_decode($response->getBody(), true);
            $raw = $result['choices'][0]['message']['content'] ?? "{}";
            $json = json_decode($raw, true);

            return response()->json([
                'status' => 'success',
                'summary' => $json['summary'] ?? "",
                'suggestions' => $json['suggestions'] ?? []
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
