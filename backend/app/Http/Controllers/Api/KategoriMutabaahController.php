<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndikatorMutabaah;
use App\Models\KategoriMutabaah;
use Illuminate\Http\Request;

class KategoriMutabaahController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        return in_array('Admin', $request->user()->roles->pluck('nama_role')->toArray());
    }

    public function index()
    {
        return response()->json(
            KategoriMutabaah::orderBy('urutan')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_mutabaahs,nama_kategori',
            'urutan' => 'nullable|integer|min:0',
        ]);

        $kategori = KategoriMutabaah::create([
            'nama_kategori' => $validated['nama_kategori'],
            'urutan' => $validated['urutan'] ?? (KategoriMutabaah::max('urutan') + 1),
        ]);

        return response()->json($kategori, 201);
    }

    public function update(Request $request, $id)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $kategori = KategoriMutabaah::findOrFail($id);
        $oldName = $kategori->nama_kategori;

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_mutabaahs,nama_kategori,' . $kategori->id,
            'urutan' => 'nullable|integer|min:0',
        ]);

        $kategori->update([
            'nama_kategori' => $validated['nama_kategori'],
            'urutan' => $validated['urutan'] ?? $kategori->urutan,
        ]);

        // Perbarui nama kategori pada indikator yang sudah terhubung
        if ($oldName !== $validated['nama_kategori']) {
            IndikatorMutabaah::where('kategori', $oldName)
                ->update(['kategori' => $validated['nama_kategori']]);
        }

        return response()->json($kategori);
    }

    public function destroy(Request $request, $id)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $kategori = KategoriMutabaah::findOrFail($id);

        $dipakai = IndikatorMutabaah::where('kategori', $kategori->nama_kategori)->exists();
        if ($dipakai) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh indikator aktif.',
            ], 422);
        }

        $kategori->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}