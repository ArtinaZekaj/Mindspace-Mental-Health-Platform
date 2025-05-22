<?php

namespace App\Http\Controllers\psychologist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientNote;
use Illuminate\Support\Facades\Auth;

class PatientNoteController extends Controller
{
    public function index()
    {
        $psychologistId = Auth::id();

        $notes = PatientNote::with('patient')
            ->where('psychologist_id', $psychologistId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'important' => 'boolean',
        ]);

        $note = PatientNote::create([
            'psychologist_id' => Auth::id(),
            'patient_id' => $request->patient_id,
            'title' => $request->title,
            'content' => $request->content,
            'important' => $request->important ?? false,
        ]);

        return response()->json(['message' => 'Note created successfully', 'data' => $note]);
    }

    public function update(Request $request, $id)
    {
        $note = PatientNote::where('psychologist_id', Auth::id())->findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'important' => 'boolean',
        ]);

        $note->update($request->only(['title', 'content', 'important']));

        return response()->json(['message' => 'Note updated successfully', 'data' => $note]);
    }

    public function destroy($id)
    {
        $note = PatientNote::where('psychologist_id', Auth::id())->findOrFail($id);
        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }
}
