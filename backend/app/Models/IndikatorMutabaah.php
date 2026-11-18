<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndikatorMutabaah extends Model
{
    use HasFactory;
    protected $table = 'indikator_mutabaah';
    protected $fillable = ['nama_indikator', 'kategori', 'bobot_nilai', 'is_active'];
}
