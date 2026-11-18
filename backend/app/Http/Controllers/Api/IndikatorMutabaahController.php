<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndikatorMutabaah;
use Illuminate\Http\Request;

class IndikatorMutabaahController extends Controller
{
    public function index(Request $request)
    {
        $query = IndikatorMutabaah::orderBy('kategori')->orderBy('id');

        // Jika parameter ?active_only=1 dikirim (misal saat Musyrif mengisi form)
        if ($request->query('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_indikator' => 'required|string|max:255',
            'kategori' => 'required|in:Ibadah,Kedisiplinan,Kebersihan,Akhlak',
            'bobot_nilai' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $indikator = IndikatorMutabaah::create($validated);

        return response()->json([
            'message' => 'Indikator mutaba\'ah berhasil ditambahkan',
            'data' => $indikator,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $indikator = IndikatorMutabaah::findOrFail($id);

        $validated = $request->validate([
            'nama_indikator' => 'required|string|max:255',
            'kategori' => 'required|in:Ibadah,Kedisiplinan,Kebersihan,Akhlak',
            'bobot_nilai' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $indikator->update($validated);

        return response()->json([
            'message' => 'Indikator mutaba\'ah berhasil diperbarui',
            'data' => $indikator,
        ]);
    }

    public function destroy($id)
    {
        $indikator = IndikatorMutabaah::findOrFail($id);
        $indikator->delete();

        return response()->json(['message' => 'Indikator berhasil dihapus']);
    }
}
