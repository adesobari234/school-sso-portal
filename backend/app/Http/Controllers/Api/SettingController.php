<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
            'nama_sekolah' => 'nullable|string|max:255',
            'tahun_ajaran' => 'required|string|max:20',
            'semester_aktif' => 'required|in:ganjil,genap',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        return response()->json([
            'message' => 'Pengaturan umum & periode akademik berhasil diperbarui.',
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

    public function publicProfile()
    {
        $logoSekolah = \App\Models\Setting::getValue('logo_sekolah');
        $logoInstansi = \App\Models\Setting::getValue('logo_instansi');

        return response()->json([
            'nama_yayasan'    => \App\Models\Setting::getValue('nama_yayasan', ''),
            'nama_sekolah'    => \App\Models\Setting::getValue('nama_sekolah', 'Portal Sekolah'),
            'alamat_sekolah'  => \App\Models\Setting::getValue('alamat_sekolah', ''),
            'telepon_sekolah' => \App\Models\Setting::getValue('telepon_sekolah', ''),
            'email_sekolah'   => \App\Models\Setting::getValue('email_sekolah', ''),
            'website_sekolah' => \App\Models\Setting::getValue('website_sekolah', ''),
            'logo_sekolah_url'  => $logoSekolah ? asset('storage/' . $logoSekolah) : null,
            'logo_instansi_url' => $logoInstansi ? asset('storage/' . $logoInstansi) : null,
        ]);
    }

    public function updateSchoolProfile(Request $request)
    {
        $roles = $request->user()->roles->pluck('nama_role')->toArray();
        if (!in_array('Admin', $roles)) {
            return response()->json(['message' => 'Hanya Admin yang dapat mengubah profil sekolah.'], 403);
        }

        $request->validate([
            'nama_yayasan'    => 'nullable|string|max:150',
            'nama_sekolah'    => 'required|string|max:150',
            'alamat_sekolah'  => 'nullable|string|max:255',
            'telepon_sekolah' => 'nullable|string|max:100',
            'email_sekolah'   => 'nullable|email|max:100',
            'website_sekolah' => 'nullable|string|max:100',
            'logo_sekolah'    => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'logo_instansi'   => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        $textFields = [
            'nama_yayasan',
            'nama_sekolah',
            'alamat_sekolah',
            'telepon_sekolah',
            'email_sekolah',
            'website_sekolah',
        ];

        foreach ($textFields as $field) {
            if ($request->has($field)) {
                \App\Models\Setting::updateOrCreate(
                    ['key' => $field],
                    ['value' => $request->input($field) ?? '']
                );
            }
        }

        // Handle Upload Logo Sekolah (Kiri)
        if ($request->hasFile('logo_sekolah')) {
            $oldLogo = \App\Models\Setting::getValue('logo_sekolah');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }
            $path = $request->file('logo_sekolah')->store('logos', 'public');
            \App\Models\Setting::updateOrCreate(['key' => 'logo_sekolah'], ['value' => $path]);
        }

        // Handle Upload Logo Instansi/Pemprov (Kanan - Opsional)
        if ($request->hasFile('logo_instansi')) {
            $oldInstansi = \App\Models\Setting::getValue('logo_instansi');
            if ($oldInstansi && Storage::disk('public')->exists($oldInstansi)) {
                Storage::disk('public')->delete($oldInstansi);
            }
            $path = $request->file('logo_instansi')->store('logos', 'public');
            \App\Models\Setting::updateOrCreate(['key' => 'logo_instansi'], ['value' => $path]);
        }

        return response()->json([
            'message' => 'Profil & KOP sekolah berhasil diperbarui.',
            'data' => $this->publicProfile()->getData(),
        ]);
    }
}
