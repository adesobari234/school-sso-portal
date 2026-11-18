<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        $roles = $request->user()->roles->pluck('nama_role')->toArray();
        return in_array('Admin', $roles);
    }

    public function index(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Hanya Admin yang dapat mengakses pengaturan.'], 403);
        }

        $settings = [
            'nama_sekolah' => Setting::getValue('nama_sekolah', 'Sekolah & Pesantren Terpadu'),
            'tahun_ajaran' => Setting::getValue('tahun_ajaran', '2026/2027'),
            'semester_aktif' => Setting::getValue('semester_aktif', 'ganjil'),
            'min_skor_izin' => Setting::getValue('min_skor_izin', '90'),
        ];

        $users = User::with('roles:id,nama_role')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json([
            'settings' => $settings,
            'users' => $users,
        ]);
    }

    public function updateSettings(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'nama_sekolah' => 'required|string|max:255',
            'tahun_ajaran' => 'required|string|max:20',
            'semester_aktif' => 'required|in:ganjil,genap',
            'min_skor_izin' => 'required|numeric|min:0|max:100',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setValue($key, (string) $value);
        }

        return response()->json([
            'message' => 'Pengaturan sistem berhasil diperbarui.',
            'settings' => $validated,
        ]);
    }

    public function resetUserPassword(Request $request, $id)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $targetUser = User::findOrFail($id);
        $targetUser->password = Hash::make($request->new_password);
        $targetUser->save();

        return response()->json([
            'message' => "Password untuk akun {$targetUser->name} berhasil direset.",
        ]);
    }
}