<?php

namespace App\Http\Controllers;

use App\Models\Ligjerues;
use Illuminate\Http\Request;

class LigjeruesController extends Controller
{
    public function index()
    {
        return Ligjerues::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'Emri' => 'required|string|max:255',
            'Mbiemri' => 'required|string|max:255',
            'Specializmi' => 'required|string|max:255',
        ]);

        return Ligjerues::create($request->all());
    }

    public function show($id)
    {
        return Ligjerues::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $ligjerues = Ligjerues::findOrFail($id);

        $request->validate([
            'Emri' => 'required|string|max:255',
            'Mbiemri' => 'required|string|max:255',
            'Specializmi' => 'required|string|max:255',
        ]);

        $ligjerues->update($request->all());

        return $ligjerues;
    }

    public function destroy($id)
    {
        $ligjerues = Ligjerues::findOrFail($id);
        $ligjerues->delete();

        return response()->json(['message' => 'Ligjeruesi u fshi me sukses']);
    }
}
