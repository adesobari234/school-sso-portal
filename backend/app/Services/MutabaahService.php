<?php

namespace App\Services;

use App\Models\MutabaahHarian;
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
            ->where('siswa_id', $siswaId)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get();

        $totalMax = 0;
        $totalEarned = 0;
        $hariHadir = 0;
        $hariIzinPulang = 0;
        $hariSakit = 0;

        $kategoriBreakdown = [
            'Ibadah' => ['earned' => 0, 'max' => 0, 'persentase' => 0],
            'Kedisiplinan' => ['earned' => 0, 'max' => 0, 'persentase' => 0],
            'Kebersihan' => ['earned' => 0, 'max' => 0, 'persentase' => 0],
            'Akhlak' => ['earned' => 0, 'max' => 0, 'persentase' => 0],
        ];

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

        return [
            'periode' => [
                'mulai' => $startDate,
                'selesai' => $endDate,
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
                'memenuhi_syarat_izin' => $persentase > 90, // Syarat mutlak > 90%
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