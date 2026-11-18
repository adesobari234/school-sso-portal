<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mutabaah_harian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnDelete();
            $table->foreignId('musyrif_id')->constrained('guru')->cascadeOnDelete();
            $table->date('tanggal');
            $table->enum('status_kehadiran', ['hadir', 'izin_pulang', 'sakit'])->default('hadir');
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Mencegah duplikasi input untuk siswa yang sama di tanggal yang sama
            $table->unique(['siswa_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mutabaah_harian');
    }
};
