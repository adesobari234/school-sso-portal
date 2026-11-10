<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\OrangTua;
use App\Models\User;
use App\Models\Role;

class OrangTuaController extends Controller
{
    public function index()
    {
        return response()->json(OrangTua::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'nik' => 'required|unique:orang_tua,nik',
            'nama_lengkap' => 'required|string|max:150',
            'no_hp_whatsapp' => 'nullable|string|max:20'
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            $roleOrangTua = Role::where('nama_role', 'Orang Tua')->first();
            $user->roles()->attach($roleOrangTua->id);

            $orangTua = OrangTua::create([
                'user_id' => $user->id,
                'nik' => $request->nik,
                'nama_lengkap' => $request->nama_lengkap,
                'no_hp_whatsapp' => $request->no_hp_whatsapp,
            ]);

            DB::commit();
            return response()->json(['message' => 'Orang Tua berhasil ditambahkan', 'data' => $orangTua], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan data', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(OrangTua::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $orangTua = OrangTua::findOrFail($id);
        $request->validate([
            'nik' => 'required|unique:orang_tua,nik,'.$orangTua->id,
            'nama_lengkap' => 'required|string|max:150',
            'no_hp' => 'nullable|string|max:20'
        ]);

        DB::beginTransaction();
        try {
            $orangTua->update($request->only(['nik', 'nama_lengkap', 'no_hp']));
            
            $user = User::find($orangTua->user_id);
            if($user) $user->update(['name' => $request->nama_lengkap]);

            DB::commit();
            return response()->json(['message' => 'Data diperbarui', 'data' => $orangTua]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $orangTua = OrangTua::findOrFail($id);
        DB::beginTransaction();
        try {
            $user = User::find($orangTua->user_id);
            $orangTua->delete();
            if($user) $user->delete();
            
            DB::commit();
            return response()->json(['message' => 'Data dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus', 'error' => $e->getMessage()], 500);
        }
    }
}