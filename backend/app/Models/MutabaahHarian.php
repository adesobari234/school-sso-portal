<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MutabaahHarian extends Model
{
    use HasFactory;
    protected $table = 'mutabaah_harian';
    protected $fillable = ['siswa_id', 'musyrif_id', 'tanggal', 'status_kehadiran', 'catatan'];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function details()
    {
        return $this->hasMany(MutabaahDetail::class, 'mutabaah_harian_id');
    }
}
