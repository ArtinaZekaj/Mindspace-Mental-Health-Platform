<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use Carbon\Carbon;
use App\Models\Mood;
use Illuminate\Http\Request;

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

    // Get all users with role 'user'
    public function patientList()
    {
        return User::where('role', 'user')
            ->select('id', 'name', 'email', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Switch the status of a specific patient between 'active' and 'inactive'
    public function toggleStatus($id)
    {
        $user = User::where('role', 'user')->findOrFail($id);
        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return response()->json(['message' => 'Status updated', 'status' => $user->status]);
    }

    //Add Patients:
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'user',
            'status' => 'active',
            'password' => bcrypt('default123') // ose gjenero një të rastësishëm
        ]);

        return response()->json($user, 201);
    }

    //Delete Patients:
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Only patients can be deleted.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Patient deleted successfully.']);
    }

    //Update Patient:
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Only patients can be updated.'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
        ]);

        $user->update($request->only('name', 'email'));

        return response()->json(['message' => 'Patient updated successfully.']);
    }

   

}
