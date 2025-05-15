<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReflectionController extends Controller
{
    public function index()
    {
        return Reflection::where('user_id', Auth::id())
            ->orderBy('date', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'theme' => 'required|string',
            'title' => 'nullable|string',
            'content' => 'required|string',
            'date' => 'required|date',
        ]);

        $reflection = Reflection::create([
            'user_id' => Auth::id(),
            'theme' => $request->theme,
            'title' => $request->title,
            'content' => $request->content,
            'date' => $request->date,
        ]);

        return response()->json(['message' => 'Reflection added.', 'data' => $reflection]);
    }

    public function update(Request $request, $id)
    {
        $reflection = Reflection::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'theme' => 'required|string',
            'title' => 'nullable|string',
            'content' => 'required|string',
            'date' => 'required|date',
        ]);

        $reflection->update($request->only(['theme', 'title', 'content', 'date']));

        return response()->json(['message' => 'Reflection updated.', 'data' => $reflection]);
    }

    public function destroy($id)
    {
        $reflection = Reflection::where('user_id', Auth::id())->findOrFail($id);
        $reflection->delete();

        return response()->json(['message' => 'Reflection deleted.']);
    }

    public function summary(Request $request)
    {
        $userId = Auth::id();
        $range = $request->query('range', 'weekly');

        $startDate = match ($range) {
            'monthly' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDays(7),
        };

        $reflections = Reflection::where('user_id', $userId)
            ->where('date', '>=', $startDate)
            ->get();

        $summary = $reflections->groupBy('theme')->map(fn($items) => count($items));
        $topTheme = $summary->sortDesc()->keys()->first();

        return response()->json([
            'message' => 'Reflection summary generated successfully.',
            'range' => $range,
            'data' => $summary,
            'top_theme' => $topTheme,
        ]);
    }

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

            $summary = $reflections->groupBy('theme')->map(fn($items) => count($items));

            $allSummaries[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'summary' => $summary,
            ];
        }

        return response()->json([
            'message' => 'Reflection summaries for all users',
            'range' => $range,
            'data' => $allSummaries,
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

        $summary = $reflections->groupBy('theme')->map(fn($items) => count($items));

        return response()->json([
            'user_id' => $id,
            'summary' => $summary
        ]);
    }

    public function reflectionsFromMyPatients(Request $request)
    {
        $psychologistId = Auth::id();
        $range = $request->query('range', 'weekly');

        // Get all patient user_ids for this psychologist
        $patientIds = \App\Models\Appointment::where('psychologist_id', $psychologistId)
            ->pluck('user_id')
            ->unique()
            ->toArray();

        // Start building the query
        $query = \App\Models\Reflection::with('user')
            ->whereIn('user_id', $patientIds);

        // If weekly, apply date filter
        if ($range === 'weekly') {
            $startDate = \Carbon\Carbon::now()->subDays(7)->toDateString();
            $query->where('date', '>=', $startDate);
        }

        $reflections = $query->orderBy('date', 'desc')->get();

        return response()->json($reflections);
    }


    // public function adminStats()
    // {
    //     $users = \App\Models\User::count();
    //     $reflectionsThisMonth = \App\Models\Reflection::whereMonth('date', now()->month)->count();
    //     $appointments = \App\Models\Appointment::count();
    //     $appointmentsApproved = \App\Models\Appointment::where('status', 'approved')->count();
    //     $appointmentsRejected = \App\Models\Appointment::where('status', 'rejected')->count();

    //     return response()->json([
    //         'users_total' => $users,
    //         'reflections_this_month' => $reflectionsThisMonth,
    //         'appointments' => [
    //             'total' => $appointments,
    //             'approved' => $appointmentsApproved,
    //             'rejected' => $appointmentsRejected,
    //         ]
    //     ]);
    // }
}
