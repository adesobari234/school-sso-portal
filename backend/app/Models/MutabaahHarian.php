<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\FilterPeriodeAkademik;
use Illuminate\Database\Eloquent\Model;

class MutabaahHarian extends Model
{
    use HasFactory;
    use FilterPeriodeAkademik;

    protected $table = 'mutabaah_harian';
    protected $fillable = ['siswa_id', 'musyrif_id', 'tanggal', 'tahun_ajaran', 'semester', 'status_kehadiran', 'catatan'];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function details()
    {
        return $this->hasMany(MutabaahDetail::class, 'mutabaah_harian_id');
    }
}
