<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AppointmentController extends Controller
{
    use AuthorizesRequests;
    //Krijimi i një rezervimi (store):
    public function store(Request $request)
    {
        $request->validate([
            'psychologist_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required'
        ]);

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'psychologist_id' => $request->psychologist_id,
            'date' => $request->date,
            'time' => $request->time,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Rezervimi u dërgua me sukses', 'data' => $appointment]);
    }


    // Lista e termineve të studentit:
    public function myAppointments()
    {
        return Appointment::with('psychologist')
            ->where('user_id', Auth::id())
            ->orderBy('date', 'desc')
            ->get();
    }

    //Lista e agjendës për psikologun:
    public function psychologistSchedule()
    {
        return Appointment::with('user')
            ->where('psychologist_id', Auth::id())
            ->orderBy('date', 'asc')
            ->get();
    }

    // Admini aprovon/refuzon
    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:approved,rejected'
    ]);

    $appointment = Appointment::findOrFail($id);

    // 🔒 KONTROLLI I AUTORIZIMIT
    $this->authorize('approve', $appointment);

    $appointment->status = $request->status;
    $appointment->save();

    return response()->json(['message' => 'Statusi u përditësua']);
}

}
