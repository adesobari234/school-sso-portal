<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Guru;
use App\Models\User;
use App\Models\Role;

class GuruController extends Controller
{
    public function index()
    {
        return response()->json(Guru::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'nip' => 'required|unique:guru,nip',
            'nama_lengkap' => 'required|string|max:150',
            'no_hp' => 'nullable|string|max:20'
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            $roleGuru = Role::where('nama_role', 'Guru')->first();
            $user->roles()->attach($roleGuru->id);

            $guru = Guru::create([
                'user_id' => $user->id,
                'nip' => $request->nip,
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp' => $request->no_hp,
            ]);

            DB::commit();
            return response()->json(['message' => 'Guru berhasil ditambahkan', 'data' => $guru], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan data', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Guru::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $guru = Guru::findOrFail($id);
        $request->validate([
            'nip' => 'required|unique:guru,nip,'.$guru->id,
            'nama_lengkap' => 'required|string|max:150',
            'no_hp' => 'nullable|string|max:20'
        ]);

        DB::beginTransaction();
        try {
            $guru->update($request->only(['nip', 'nama_lengkap', 'no_hp']));
            
            $user = User::find($guru->user_id);
            if($user) $user->update(['name' => $request->nama_lengkap]);

            DB::commit();
            return response()->json(['message' => 'Data diperbarui', 'data' => $guru]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $guru = Guru::findOrFail($id);
        DB::beginTransaction();
        try {
            $user = User::find($guru->user_id);
            $guru->delete();
            if($user) $user->delete();
            
            DB::commit();
            return response()->json(['message' => 'Data dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus', 'error' => $e->getMessage()], 500);
        }
    }
}