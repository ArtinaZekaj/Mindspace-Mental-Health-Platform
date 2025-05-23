<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use Carbon\Carbon;
use App\Models\Mood;

class AdminController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $totalUsers = User::where('role', 'user')->count();
        $totalPsychologists = User::where('role', 'psychologist')->count();
        $appointmentsToday = Appointment::whereDate('date', Carbon::today())->count();
        $appointmentsThisMonth = Appointment::whereMonth('date', Carbon::now()->month)->count();


        return response()->json([
            'total_users' => $totalUsers,
            'total_psychologists' => $totalPsychologists,
            'appointments_today' => $appointmentsToday,
            'appointments_this_month' => $appointmentsThisMonth,
        ]);
    }

    //Recent Appointments
    public function recentAppointments()
    {
        $appointments = Appointment::with(['user:id,name', 'psychologist:id,name'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->take(5)
            ->get();

        return response()->json($appointments);
    }

    //Mood Statistics
    public function moodStatistics()
{
    $moods = Mood::select('mood')->get();

    // Group moods based on actual labels in database
    $positive = $moods->whereIn('mood', ['Happy', 'Very Happy'])->count();
    $neutral = $moods->where('mood', 'Neutral')->count();
    $negative = $moods->whereIn('mood', ['Sad', 'Very Sad'])->count();

    $total = $positive + $neutral + $negative;

    return response()->json([
        'positive' => $positive,
        'neutral' => $neutral,
        'negative' => $negative,
        'total' => $total
    ]);
}
}
