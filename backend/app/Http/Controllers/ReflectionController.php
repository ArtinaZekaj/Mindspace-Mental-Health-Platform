<?php

// app/Http/Controllers/ReflectionController.php
namespace App\Http\Controllers;

use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}

