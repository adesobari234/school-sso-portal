<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MutabaahDetail extends Model
{
    use HasFactory;
    protected $table = 'mutabaah_detail';
    protected $fillable = ['mutabaah_harian_id', 'indikator_id', 'is_tercapai'];

    public function indikator()
    {
        return $this->belongsTo(IndikatorMutabaah::class, 'indikator_id');
    }
}
