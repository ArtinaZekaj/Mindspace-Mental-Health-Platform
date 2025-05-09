<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Carbon\Carbon;


class AppointmentController extends Controller
{
    use AuthorizesRequests;
    //Krijimi i një rezervimi (store):
    public function store(Request $request)
    {
        $request->validate([
            'psychologist_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'discussion' => 'nullable|string'
        ]);

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'psychologist_id' => $request->psychologist_id,
            'date' => $request->date,
            'time' => Carbon::parse($request->time)->format('H:i:s'),
            'status' => 'pending',
            'discussion' => $request->discussion
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

    public function destroy($id)
    {
        $appointment = Appointment::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->findOrFail($id);

        $appointment->delete();

        return response()->json(['message' => 'Takimi u anulua me sukses.']);
    }

    public function availableSlots(Request $request)
{
    $request->validate([
        'psychologist_id' => 'required|exists:users,id',
        'date' => 'required|date'
    ]);

    $slotMap = [
        '9:00 AM'  => '09:00:00',
        '10:00 AM' => '10:00:00',
        '11:00 AM' => '11:00:00',
        '2:00 PM'  => '14:00:00',
        '3:00 PM'  => '15:00:00',
        '4:00 PM'  => '16:00:00',
    ];

    $takenTimes = Appointment::where('psychologist_id', $request->psychologist_id)
        ->where('date', $request->date)
        ->whereIn('status', ['pending', 'approved'])
        ->pluck('time')
        ->map(fn($t) => \Carbon\Carbon::parse($t)->format('H:i:s'))
        ->toArray();

    $available = [];
    foreach ($slotMap as $label => $dbTime) {
        if (!in_array($dbTime, $takenTimes)) {
            $available[] = $label;
        }
    }

    return response()->json(['slots' => $available]);
}




}
