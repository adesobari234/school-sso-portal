<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Siswa;
use App\Models\User;
use App\Models\Role;

class SiswaController extends Controller
{
    public function index()
    {
        // Mengambil semua data siswa, diurutkan dari yang terbaru
        $siswa = Siswa::orderBy('created_at', 'desc')->get();
        return response()->json($siswa);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input dari Next.js
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'nisn' => 'required|unique:siswa,nisn',
            'nama_lengkap' => 'required|string|max:150',
            'angkatan' => 'required|integer',
            'kamar_asrama_id' => 'nullable|integer'
        ]);

        DB::beginTransaction();
        try {
            // 2. Buat Akun User untuk Login
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            // Hubungkan user ini dengan role "Siswa"
            $roleSiswa = Role::where('nama_role', 'Siswa')->first();
            $user->roles()->attach($roleSiswa->id);

            // 3. Buat Profil Siswa
            $siswa = Siswa::create([
                'user_id' => $user->id,
                'nisn' => $request->nisn,
                'nama_lengkap' => $request->nama_lengkap,
                'angkatan' => $request->angkatan,
                'kamar_asrama_id' => $request->kamar_asrama_id,
            ]);

            DB::commit(); // Simpan permanen ke database
            
            return response()->json([
                'message' => 'Siswa berhasil ditambahkan',
                'data' => $siswa
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan jika ada yang error
            return response()->json([
                'message' => 'Gagal menambahkan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 1. Ambil data spesifik untuk diisi ke dalam form Edit
    public function show($id)
    {
        $siswa = Siswa::findOrFail($id);
        return response()->json($siswa);
    }

    // 2. Simpan perubahan data (Update)
    public function update(Request $request, $id)
    {
        $siswa = Siswa::findOrFail($id);

        $request->validate([
            // Abaikan pengecekan NISN unik untuk ID siswa yang sedang diedit
            'nisn' => 'required|unique:siswa,nisn,'.$siswa->id, 
            'nama_lengkap' => 'required|string|max:150',
            'angkatan' => 'required|integer',
            'kamar_asrama_id' => 'nullable|integer'
        ]);

        DB::beginTransaction();
        try {
            // Update profil siswa
            $siswa->update([
                'nisn' => $request->nisn,
                'nama_lengkap' => $request->nama_lengkap,
                'angkatan' => $request->angkatan,
                'kamar_asrama_id' => $request->kamar_asrama_id,
            ]);

            // Sinkronkan nama di akun User loginnya
            $user = User::find($siswa->user_id);
            if($user) {
                $user->update(['name' => $request->nama_lengkap]);
            }

            DB::commit();
            return response()->json(['message' => 'Data berhasil diperbarui', 'data' => $siswa]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui data', 'error' => $e->getMessage()], 500);
        }
    }

    // 3. Hapus data (Delete)
    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);
        
        DB::beginTransaction();
        try {
            $user = User::find($siswa->user_id);
            
            $siswa->delete(); // Hapus profil
            if($user) $user->delete(); // Hapus akun login terkait
            
            DB::commit();
            return response()->json(['message' => 'Data berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus data', 'error' => $e->getMessage()], 500);
        }
    }
}