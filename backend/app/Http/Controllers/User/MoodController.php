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

    //Funksioni per AI, per te marre 7 moods te fundit !
    public function aiUserMoods()
    {
        $userId = Auth::id();

        $moods = Mood::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get(['mood', 'date']);

        return response()->json([
            'status' => 'success',
            'data' => $moods
        ]);
    }

    //Funksioni lexo mood-in , dergoje tek OpenAI, kthe suggestions psikologjik
    public function aiSuggestion()
    {
        try {
            $client = new \GuzzleHttp\Client();

            $lastMood = Mood::where('user_id', Auth::id())
                ->orderBy('date', 'desc')
                ->first();

            $userMood = $lastMood ? $lastMood->mood : "neutral";

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
                                "role" => "user",
                                "content" =>
                                "The user's current mood is: $userMood.
                                You are an empathetic mental health assistant. Return ONLY JSON in this structure:
                                {
                                  \"summary\": \"...\",
                                  \"suggestions\": [
                                    { \"title\": \"..\", \"description\": \"..\", \"icon\": \"heart\" },
                                    { \"title\": \"..\", \"description\": \"..\", \"icon\": \"support\" },
                                    { \"title\": \"..\", \"description\": \"..\", \"icon\": \"movement\" }
                                  ]
                                }
                                No other text outside JSON."
                            ]
                        ],
                        "max_tokens" => 200,
                    ]),
                ]
            );

            $result = json_decode($response->getBody(), true);

            $raw = $result['choices'][0]['message']['content'] ?? "{}";

            // Parse JSON the model returned
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
