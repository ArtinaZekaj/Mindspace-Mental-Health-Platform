<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Reflection;
use Illuminate\Support\Facades\Auth;

class CalendarController extends Controller
{
    public function monthOverview(Request $request)
    {
        $user = Auth::user();
        $month = $request->query('month'); 

        $appointments = Appointment::where('user_id', $user->id)
            ->where('date', 'like', "$month%")
            ->pluck('date');

        $reflections = Reflection::where('user_id', $user->id)
            ->where('date', 'like', "$month%")
            ->pluck('date');

        return response()->json([
            'appointments' => $appointments,
            'reflections' => $reflections
        ]);
    }
}
