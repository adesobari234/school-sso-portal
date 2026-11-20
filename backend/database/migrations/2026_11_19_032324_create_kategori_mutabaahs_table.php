<?php

use App\Models\IndikatorMutabaah;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::create('kategori_mutabaahs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori')->unique();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // Isi kategori default agar data indikator lama tetap cocok
        $defaults = ['Ibadah', 'Kedisiplinan', 'Kebersihan', 'Akhlak'];
        foreach ($defaults as $idx => $nama) {
            DB::table('kategori_mutabaahs')->insert([
                'nama_kategori' => $nama,
                'urutan' => $idx + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('kategori_mutabaahs');
    }
};
