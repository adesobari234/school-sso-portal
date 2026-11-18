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
        Schema::create('indikator_mutabaah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_indikator');
            $table->enum('kategori', ['Ibadah', 'Kedisiplinan', 'Kebersihan', 'Akhlak'])->default('Ibadah');
            $table->integer('bobot_nilai')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('indikator_mutabaah');
    }
};
