<?php

// app/Http/Controllers/ReflectionController.php
namespace App\Http\Controllers;

use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReflectionController extends Controller
{
    public function index()
    {
        return Reflection::where('user_id', Auth::id())->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'mood' => 'required|string',
            'date' => 'required|date'
        ]);

        $reflection = Reflection::create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'mood' => $request->mood,
            'date' => $request->date
        ]);

        return response()->json(['message' => 'Reflection added.', 'data' => $reflection]);
    }

    public function update(Request $request, $id)
    {
        $reflection = Reflection::where('user_id', Auth::id())->findOrFail($id);

        $reflection->update($request->only(['content', 'mood', 'date']));

        return response()->json(['message' => 'Reflection updated.', 'data' => $reflection]);
    }

    public function destroy($id)
    {
        $reflection = Reflection::where('user_id', Auth::id())->findOrFail($id);
        $reflection->delete();

        return response()->json(['message' => 'Reflection deleted.']);
    }

    //Vetem per perdoruesit e thjeshte te shohin grafikun e tyre per nje jave ose nje muaj.
    public function summary(Request $request)
    {
        $userId = Auth::id();
        $range = $request->query('range', 'weekly'); // default weekly

        $startDate = match ($range) {
            'monthly' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDays(7),
        };

        $reflections = Reflection::where('user_id', $userId)
            ->where('date', '>=', $startDate)
            ->get();

        $summary = $reflections->groupBy('mood')->map(fn($items) => count($items));
        $topMood = $summary->sortDesc()->keys()->first();

        $motivationalMessages = [
            'happy' => "You've felt happy most often — keep spreading that joy and stay present! 😊",
            'calm' => "Your calmness is your superpower. Keep protecting your peace. 🌿",
            'focused' => "You've been focused — that's amazing! Stay consistent and reward yourself. 🎯",
            'relaxed' => "You've found relaxation — take a deep breath and enjoy this peace. 🧘",
            'sad' => "You've felt sad frequently. It’s okay to feel this way — try journaling, reaching out to a friend, or going for a walk to lift your mood. 💙",
            'anxious' => "Anxiety has shown up often. You're not alone — try grounding exercises or a short meditation to regain calm. 🌬️"
        ];

        return response()->json([
            'message' => 'Mood summary generated successfully.',
            'range' => $range,
            'data' => $summary,
            'top_mood' => $topMood,
            'insight' => $motivationalMessages[$topMood] ?? "Keep checking in with yourself — your feelings matter. 💫"
        ]);
    }
    //Per rolin Admin i cili ka mundesi te shoh statistikat per te gjithe user-at
    public function summaryAll(Request $request)
    {
        $range = $request->query('range', 'weekly');

        $startDate = match ($range) {
            'monthly' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDays(7),
        };

        $allUsers = \App\Models\User::all();
        $allSummaries = [];

        foreach ($allUsers as $user) {
            $reflections = Reflection::where('user_id', $user->id)
                ->where('date', '>=', $startDate)
                ->get();

            $summary = $reflections->groupBy('mood')->map(fn($items) => count($items));

            $allSummaries[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'summary' => $summary
            ];
        }

        return response()->json([
            'message' => 'Mood summaries for all users',
            'range' => $range,
            'data' => $allSummaries
        ]);
    }

    public function summaryForUser(Request $request, $id)
    {
        $range = $request->query('range', 'weekly');
        $startDate = match ($range) {
            'monthly' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDays(7),
        };

        $reflections = Reflection::where('user_id', $id)
            ->where('date', '>=', $startDate)
            ->get();

        $summary = $reflections->groupBy('mood')->map(fn($items) => count($items));

        return response()->json([
            'user_id' => $id,
            'summary' => $summary
        ]);
    }

    public function adminStats()
    {
        $users = \App\Models\User::count();
        $reflectionsThisMonth = \App\Models\Reflection::whereMonth('date', now()->month)->count();
        $appointments = \App\Models\Appointment::count();
        $appointmentsApproved = \App\Models\Appointment::where('status', 'approved')->count();
        $appointmentsRejected = \App\Models\Appointment::where('status', 'rejected')->count();

        return response()->json([
            'users_total' => $users,
            'reflections_this_month' => $reflectionsThisMonth,
            'appointments' => [
                'total' => $appointments,
                'approved' => $appointmentsApproved,
                'rejected' => $appointmentsRejected,
            ]
        ]);
    }
}
