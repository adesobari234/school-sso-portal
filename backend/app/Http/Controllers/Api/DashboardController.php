<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\OrangTua;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('nama_role')->toArray();

        $response = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $roles,
            ],
            'periode_aktif' => [
                'tahun_ajaran' => \App\Models\Setting::getValue('tahun_ajaran', '2026/2027'),
                'semester' => ucfirst(\App\Models\Setting::getValue('semester_aktif', 'ganjil')),
            ],
        ];

        // 1. Data khusus Admin
        if (in_array('Admin', $roles)) {
            $response['stats'] = [
                'total_siswa' => Siswa::count(),
                'total_guru' => Guru::count(),
                'total_orang_tua' => OrangTua::count(),
            ];
        }

        // 2. Data khusus Guru
        if (in_array('Guru', $roles)) {
            $response['guru'] = $user->guru;
            $response['is_musyrif'] = $user->guru
                ? ((bool) $user->guru->is_musyrif || Siswa::where('musyrif_id', $user->guru->id)->exists())
                : false;
            $response['stats'] = [
                'total_siswa' => Siswa::count(),
            ];
        }

        // 3. Data khusus Siswa (termasuk relasi Orang Tua dari tabel pivot)
        if (in_array('Siswa', $roles)) {
            $siswa = $user->siswa;
            if ($siswa) {
                $siswa->load('orangTua');
            }
            $response['siswa'] = $siswa;
        }

        // 4. Data khusus Orang Tua (termasuk daftar anak dari tabel pivot)
        if (in_array('Orang Tua', $roles)) {
            $orangTua = $user->orangTua;
            if ($orangTua) {
                $orangTua->load('siswa');
            }
            $response['orang_tua'] = $orangTua;
        }

        return response()->json($response);
    }
}
