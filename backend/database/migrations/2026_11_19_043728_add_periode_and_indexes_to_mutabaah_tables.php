<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mutabaah_harian', function (Blueprint $table) {
            $table->string('tahun_ajaran', 20)->default('2026/2027')->after('tanggal');
            $table->string('semester', 10)->default('ganjil')->after('tahun_ajaran');

            $table->index(
                ['siswa_id', 'tahun_ajaran', 'semester', 'tanggal'],
                'idx_mutabaah_siswa_periode'
            );
        });

        Schema::table('mutabaah_detail', function (Blueprint $table) {
            $table->index(
                ['mutabaah_harian_id', 'indikator_id'],
                'idx_detail_harian_indikator'
            );
        });

        $tahunAktif = Setting::getValue('tahun_ajaran', '2026/2027');
        $semesterAktif = Setting::getValue('semester_aktif', 'ganjil');

        DB::table('mutabaah_harian')->update([
            'tahun_ajaran' => $tahunAktif,
            'semester' => $semesterAktif,
        ]);
    }

    public function down(): void
    {
        Schema::table('mutabaah_detail', function (Blueprint $table) {
            $table->dropIndex('idx_detail_harian_indikator');
        });

        Schema::table('mutabaah_harian', function (Blueprint $table) {
            $table->dropIndex('idx_mutabaah_siswa_periode');
            $table->dropColumn(['tahun_ajaran', 'semester']);
        });
    }
};