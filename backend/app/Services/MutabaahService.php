<?php

namespace App\Services;

use App\Models\MutabaahHarian;
use App\Models\Setting;
use App\Models\KategoriMutabaah;
use Carbon\Carbon;

class MutabaahService
{
    /**
     * Menghitung skor mutaba'ah siswa pada rentang tanggal tertentu.
     * Hanya hari berstatus 'hadir' yang masuk ke dalam perhitungan pembagi.
     */
    public function hitungSkor($siswaId, $startDate, $endDate)
    {
        $records = MutabaahHarian::with('details.indikator')
            ->periodeAktif()
            ->where('siswa_id', $siswaId)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get();

        $totalMax = 0;
        $totalEarned = 0;
        $hariHadir = 0;
        $hariIzinPulang = 0;
        $hariSakit = 0;

        $kategoriNames = KategoriMutabaah::orderBy('urutan')->orderBy('id')->pluck('nama_kategori');
        $kategoriBreakdown = [];
        foreach ($kategoriNames as $namaKat) {
            $kategoriBreakdown[$namaKat] = ['earned' => 0, 'max' => 0, 'persentase' => 0];
        }

        foreach ($records as $record) {
            if ($record->status_kehadiran === 'izin_pulang') {
                $hariIzinPulang++;
                continue; // Tidak dihitung sebagai hari aktif asrama
            }

            if ($record->status_kehadiran === 'sakit') {
                $hariSakit++;
                continue;
            }

            $hariHadir++;

            foreach ($record->details as $detail) {
                if (!$detail->indikator) continue;

                $bobot = $detail->indikator->bobot_nilai;
                $kategori = $detail->indikator->kategori;

                $totalMax += $bobot;
                if (isset($kategoriBreakdown[$kategori])) {
                    $kategoriBreakdown[$kategori]['max'] += $bobot;
                }

                if ($detail->is_tercapai) {
                    $totalEarned += $bobot;
                    if (isset($kategoriBreakdown[$kategori])) {
                        $kategoriBreakdown[$kategori]['earned'] += $bobot;
                    }
                }
            }
        }

        // Hitung persentase masing-masing kategori untuk rapor Wali Bina
        foreach ($kategoriBreakdown as $kat => $val) {
            $kategoriBreakdown[$kat]['persentase'] = $val['max'] > 0
                ? round(($val['earned'] / $val['max']) * 100, 1)
                : 0;
        }

        $persentase = $totalMax > 0 ? round(($totalEarned / $totalMax) * 100, 1) : 0;
        $batasMinimal = (float) Setting::getValue('min_skor_izin', 90);

        return [
            'periode' => [
                'mulai' => $startDate,
                'selesai' => $endDate,
                'tahun_ajaran' => Setting::getValue('tahun_ajaran', '2026/2027'),
                'semester' => ucfirst(Setting::getValue('semester_aktif', 'ganjil')),
            ],
            'kehadiran' => [
                'hadir' => $hariHadir,
                'izin_pulang' => $hariIzinPulang,
                'sakit' => $hariSakit,
            ],
            'skor' => [
                'poin_diperoleh' => $totalEarned,
                'poin_maksimal' => $totalMax,
                'persentase' => $persentase,
                'batas_minimal_izin' => $batasMinimal,
                'memenuhi_syarat_izin' => $persentase > $batasMinimal,
            ],
            'per_kategori' => $kategoriBreakdown,
        ];
    }

    /**
     * Shortcut pengecekan cepat pekan berjalan (Senin - Minggu) untuk modul Perizinan
     */
    public function cekKelayakanIzinPekanan($siswaId)
    {
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();
        $endOfWeek = Carbon::now()->endOfWeek(Carbon::SUNDAY)->toDateString();

        return $this->hitungSkor($siswaId, $startOfWeek, $endOfWeek);
    }
}