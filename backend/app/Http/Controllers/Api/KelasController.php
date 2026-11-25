<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index()
    {
        $kelas = Kelas::with('waliKelas')
            ->withCount('siswa')
            ->orderBy('tingkat')
            ->orderBy('nama_kelas')
            ->get();

        return response()->json($kelas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kelas' => 'required|string|max:50',
            'tingkat' => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:guru,id',
        ]);

        $kelas = Kelas::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data' => $kelas->load('waliKelas'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $validated = $request->validate([
            'nama_kelas' => 'required|string|max:50',
            'tingkat' => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:guru,id',
        ]);

        $kelas->update($validated);

        return response()->json([
            'message' => 'Data kelas berhasil diperbarui.',
            'data' => $kelas->load('waliKelas'),
        ]);
    }

    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus.',
        ]);
    }

    // Endpoint untuk plotting/penempatan siswa ke dalam kelas
    public function assignSiswa(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $validated = $request->validate([
            'siswa_ids' => 'required|array',
            'siswa_ids.*' => 'exists:siswa,id',
        ]);

        // Lepas siswa lama yang tidak lagi dicentang di kelas ini
        Siswa::where('kelas_id', $kelas->id)
            ->whereNotIn('id', $validated['siswa_ids'])
            ->update(['kelas_id' => null]);

        // Pasangkan siswa yang dicentang ke kelas ini
        Siswa::whereIn('id', $validated['siswa_ids'])
            ->update(['kelas_id' => $kelas->id]);

        return response()->json([
            'message' => "Penempatan siswa untuk kelas {$kelas->nama_kelas} berhasil disimpan.",
        ]);
    }
}