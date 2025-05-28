<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use Carbon\Carbon;
use App\Models\Mood;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'password' => bcrypt('default123')
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

    // Get all psychologists with patients count
    public function psychologistList()
    {
        $psychologists = User::where('role', 'psychologist')
            ->select('id', 'name', 'email', 'status')
            ->get();

        $appointments = Appointment::select('psychologist_id', 'user_id')
            ->distinct()
            ->get();

        $grouped = $appointments->groupBy('psychologist_id')->map(function ($group) {
            return $group->pluck('user_id')->unique()->count();
        });

        foreach ($psychologists as $p) {
            $p->patients_count = $grouped[$p->id] ?? 0;
        }

        return $psychologists;
    }


    // Toggle psychologist status
    public function togglePsychologistStatus($id)
    {
        $user = User::where('role', 'psychologist')->findOrFail($id);
        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return response()->json(['message' => 'Status updated', 'status' => $user->status]);
    }

    //Add Psychologist:
    public function storePsychologist(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'psychologist',
            'status' => 'active',
            'password' => bcrypt('default123')
        ]);

        return response()->json($user, 201);
    }
    //Update Psychologist
    public function updatePsychologist(Request $request, $id)
    {
        $user = User::where('role', 'psychologist')->findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
        ]);

        $user->update($request->only('name', 'email'));

        return response()->json(['message' => 'Psychologist updated successfully.']);
    }
    //Delete Psychologist
    public function destroyPsychologist($id)
    {
        $user = User::where('role', 'psychologist')->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Psychologist deleted successfully.']);
    }

    // Get all appointments with user and psychologist info
    public function allAppointments()
    {
        $appointments = Appointment::with(['user:id,name', 'psychologist:id,name'])
            ->orderBy('date', 'desc')
            ->orderBy('time')
            ->get();

        return response()->json($appointments);
    }

    //Update status, approved or canceled:
    public function updateAppointmentStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->status = $validated['status'];
        $appointment->save();

        return response()->json(['message' => 'Status updated successfully.']);
    }

    //Add Appointment:
    public function storeAdminAppointment(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'psychologist_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'required',
            'status' => 'in:pending,approved,rejected',
        ]);

        $appointment = Appointment::create([
            'user_id' => $validated['user_id'],
            'psychologist_id' => $validated['psychologist_id'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'status' => $validated['status'] ?? 'pending',
        ]);

        return response()->json($appointment, 201);
    }
}
