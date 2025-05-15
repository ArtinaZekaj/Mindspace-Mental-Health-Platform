<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Mood;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;

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
}
