<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MutabaahDetail;
use App\Models\MutabaahHarian;
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\Setting;
use App\Services\MutabaahService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MutabaahController extends Controller
{
    protected $mutabaahService;

    public function __construct(MutabaahService $mutabaahService)
    {
        $this->mutabaahService = $mutabaahService;
    }

    /**
     * Admin memasangkan daftar siswa ke seorang Musyrif (Guru)
     */
    public function assignMusyrif(Request $request)
    {
        $request->validate([
            'musyrif_id' => 'nullable|exists:guru,id',
            'siswa_ids' => 'required|array',
            'siswa_ids.*' => 'exists:siswa,id',
        ]);

        Siswa::whereIn('id', $request->siswa_ids)->update([
            'musyrif_id' => $request->musyrif_id,
        ]);
        Guru::where('id', $request->musyrif_id)->update(['is_musyrif' => true]);

        return response()->json([
            'message' => 'Penugasan musyrif berhasil diperbarui',
        ]);
    }

    /**
     * Mengambil daftar santri binaan Musyrif (atau semua siswa jika Admin)
     * beserta status input pada tanggal tertentu, skor pekanan, dan notifikasi hari terlewat.
     */
    public function santriBinaan(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('nama_role')->toArray();
        $tanggal = $request->query('tanggal', Carbon::today()->toDateString());

        if (in_array('Guru', $roles) && !in_array('Admin', $roles)) {
            $guru = $user->guru;
            $isMusyrif = $guru && ($guru->is_musyrif || \App\Models\Siswa::where('musyrif_id', $guru->id)->exists());
            if (!$isMusyrif) {
                return response()->json(['message' => 'Akses ditolak. Anda tidak terdaftar sebagai Musyrif.'], 403);
            }
        }

        if (in_array('Admin', $roles)) {
            $santriList = Siswa::with('musyrif')->orderBy('nama_lengkap')->get();
        } elseif (in_array('Guru', $roles) && $user->guru) {
            $santriList = Siswa::where('musyrif_id', $user->guru->id)
                ->orderBy('nama_lengkap')
                ->get();
        } else {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        // Cek rentang hari yang sudah lewat pada pekan berjalan (Senin s/d Kemarin)
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $yesterday = Carbon::yesterday()->startOfDay();

        $expectedDates = [];
        if ($yesterday->gte($startOfWeek)) {
            $cursor = $startOfWeek->copy();
            while ($cursor->lte($yesterday)) {
                $expectedDates[] = $cursor->toDateString();
                $cursor->addDay();
            }
        }

        // Ambil seluruh catatan pada rentang pekan berjalan dalam 1 query agar ringan
        $siswaIds = $santriList->pluck('id')->toArray();
        $existingMap = [];
        if (!empty($expectedDates) && !empty($siswaIds)) {
            $existingRecords = MutabaahHarian::whereIn('siswa_id', $siswaIds)
                ->whereIn('tanggal', $expectedDates)
                ->get(['siswa_id', 'tanggal']);

            foreach ($existingRecords as $rec) {
                $existingMap[$rec->siswa_id][$rec->tanggal] = true;
            }
        }

        // Rekap tanggal mana saja yang masih memiliki santri belum diinput
        $rekapTanggalTerlewat = [];
        foreach ($expectedDates as $tglCek) {
            $belumDiisiCount = 0;
            foreach ($santriList as $s) {
                if (!isset($existingMap[$s->id][$tglCek])) {
                    $belumDiisiCount++;
                }
            }
            if ($belumDiisiCount > 0) {
                $rekapTanggalTerlewat[] = [
                    'tanggal' => $tglCek,
                    'jumlah_santri' => $belumDiisiCount,
                ];
            }
        }

        $result = $santriList->map(function ($siswa) use ($tanggal, $expectedDates, $existingMap) {
            $catatanHariIni = MutabaahHarian::with('details')
                ->periodeAktif()
                ->where('siswa_id', $siswa->id)
                ->where('tanggal', $tanggal)
                ->first();

            $evaluasiPekanan = $this->mutabaahService->cekKelayakanIzinPekanan($siswa->id);

            $hariTerlewatSiswa = [];
            foreach ($expectedDates as $tglCek) {
                if (!isset($existingMap[$siswa->id][$tglCek])) {
                    $hariTerlewatSiswa[] = $tglCek;
                }
            }

            return [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama_lengkap' => $siswa->nama_lengkap,
                'angkatan' => $siswa->angkatan,
                'musyrif' => $siswa->musyrif ? $siswa->musyrif->nama_lengkap : 'Belum ditentukan',
                'sudah_diisi' => (bool) $catatanHariIni,
                'data_harian' => $catatanHariIni,
                'skor_pekanan' => $evaluasiPekanan['skor'],
                'jumlah_hari_terlewat' => count($hariTerlewatSiswa),
                'tanggal_terlewat' => $hariTerlewatSiswa,
            ];
        });

        return response()->json([
            'tanggal' => $tanggal,
            'ringkasan_terlewat' => [
                'total_hari_terlewat' => count($rekapTanggalTerlewat),
                'detail_tanggal' => $rekapTanggalTerlewat,
            ],
            'santri' => $result,
        ]);
    }

    /**
     * Musyrif menyimpan / memperbarui pencatatan mutaba'ah harian santri
     */
    public function storeHarian(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'tanggal' => 'required|date',
            'status_kehadiran' => 'required|in:hadir,izin_pulang,sakit',
            'catatan' => 'nullable|string',
            'details' => 'required_if:status_kehadiran,hadir|array',
            'details.*.indikator_id' => 'required|exists:indikator_mutabaah,id',
            'details.*.is_tercapai' => 'required|boolean',
        ]);

        $user = $request->user();
        $siswa = Siswa::findOrFail($request->siswa_id);

        // Tentukan ID musyrif pencatat
        $musyrifId = $user->guru ? $user->guru->id : $siswa->musyrif_id;
        if (!$musyrifId) {
            return response()->json([
                'message' => 'Siswa belum memiliki Musyrif pembina atau akun Anda bukan profil Guru/Musyrif.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $harian = MutabaahHarian::updateOrCreate(
                [
                    'siswa_id' => $siswa->id,
                    'tanggal' => $request->tanggal,
                ],
                [
                    'musyrif_id' => $musyrifId,
                    'tahun_ajaran' => Setting::getValue('tahun_ajaran', '2026/2027'),
                    'semester' => Setting::getValue('semester_aktif', 'ganjil'),
                    'status_kehadiran' => $request->status_kehadiran,
                    'catatan' => $request->catatan,
                ]
            );

            // Hapus detail lama jika sedang mengedit tanggal yang sama
            MutabaahDetail::where('mutabaah_harian_id', $harian->id)->delete();

            // Simpan detail indikator hanya jika siswa berstatus 'hadir' di asrama
            if ($request->status_kehadiran === 'hadir' && !empty($request->details)) {
                foreach ($request->details as $item) {
                    MutabaahDetail::create([
                        'mutabaah_harian_id' => $harian->id,
                        'indikator_id' => $item['indikator_id'],
                        'is_tercapai' => $item['is_tercapai'],
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Catatan mutaba\'ah berhasil disimpan',
                'data' => $harian->load('details'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan catatan mutaba\'ah',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rekap Mutaba'ah (Pekanan / Bulanan / Semester) untuk Musyrif, Wali Bina, Siswa, & Orang Tua
     */
    public function rekapSiswa(Request $request, $siswaId)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('nama_role')->toArray();
        $siswa = Siswa::with('musyrif')->findOrFail($siswaId);

        if (in_array('Guru', $roles) && !in_array('Admin', $roles)) {
            $guru = $user->guru;
            $isMusyrif = $guru && ($guru->is_musyrif || \App\Models\Siswa::where('musyrif_id', $guru->id)->exists());
            if (!$isMusyrif) {
                return response()->json(['message' => 'Akses ditolak. Anda tidak terdaftar sebagai Musyrif.'], 403);
            }
        }

        // Validasi hak akses kepemilikan data
        $bolehAkses = false;
        if (in_array('Admin', $roles) || in_array('Guru', $roles)) {
            $bolehAkses = true;
        } elseif (in_array('Siswa', $roles) && $user->siswa && $user->siswa->id == $siswa->id) {
            $bolehAkses = true;
        } elseif (in_array('Orang Tua', $roles) && $user->orangTua) {
            $anakIds = $user->orangTua->siswa()->pluck('siswa.id')->toArray();
            $bolehAkses = in_array($siswa->id, $anakIds);
        }

        if (!$bolehAkses) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke rekap siswa ini'], 403);
        }

        $periode = $request->query('periode', 'pekanan'); // pekanan | bulanan | semester
        $now = Carbon::now();

        if ($periode === 'bulanan') {
            $bulan = $request->query('bulan', $now->month);
            $tahun = $request->query('tahun', $now->year);
            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth()->toDateString();
            $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth()->toDateString();
        } elseif ($periode === 'semester') {
            $tahun = $request->query('tahun', $now->year);
            $semester = $request->query('semester', $now->month <= 6 ? 'genap' : 'ganjil');
            if ($semester === 'genap') {
                $startDate = "$tahun-01-01";
                $endDate = "$tahun-06-30";
            } else {
                $startDate = "$tahun-07-01";
                $endDate = "$tahun-12-31";
            }
        } else {
            // Default: pekanan (Senin - Minggu pekan ini)
            $startDate = $now->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
            $endDate = $now->copy()->endOfWeek(Carbon::SUNDAY)->toDateString();
        }

        $evaluasi = $this->mutabaahService->hitungSkor($siswa->id, $startDate, $endDate);

        // Sertakan riwayat harian pada rentang tersebut
        $riwayat = MutabaahHarian::with('details.indikator')
            ->periodeAktif()
            ->where('siswa_id', $siswa->id)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json([
            'siswa' => [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama_lengkap' => $siswa->nama_lengkap,
                'angkatan' => $siswa->angkatan,
                'musyrif' => $siswa->musyrif ? $siswa->musyrif->nama_lengkap : '-',
            ],
            'tipe_periode' => $periode,
            'evaluasi' => $evaluasi,
            'riwayat' => $riwayat,
        ]);
    }

    public function getSettings(Request $request)
    {
        $roles = $request->user()->roles->pluck('nama_role')->toArray();
        if (!in_array('Admin', $roles)) {
            return response()->json(['message' => 'Hanya Admin yang dapat mengakses pengaturan ini.'], 403);
        }

        return response()->json([
            'min_skor_izin' => Setting::getValue('min_skor_izin', '90'),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $roles = $request->user()->roles->pluck('nama_role')->toArray();
        if (!in_array('Admin', $roles)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'min_skor_izin' => 'required|numeric|min:0|max:100',
        ]);

        Setting::setValue('min_skor_izin', (string) $validated['min_skor_izin']);

        return response()->json([
            'message' => 'Pengaturan Mutaba\'ah berhasil disimpan.',
            'min_skor_izin' => $validated['min_skor_izin'],
        ]);
    }
}
