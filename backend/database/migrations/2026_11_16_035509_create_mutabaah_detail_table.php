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
        Schema::create('mutabaah_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mutabaah_harian_id')->constrained('mutabaah_harian')->cascadeOnDelete();
            $table->foreignId('indikator_id')->constrained('indikator_mutabaah')->cascadeOnDelete();
            $table->boolean('is_tercapai')->default(false);
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
        Schema::dropIfExists('mutabaah_detail');
    }
};
