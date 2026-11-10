<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrangTua extends Model
{
    protected $table = 'orang_tua';
    protected $fillable = ['user_id', 'nik', 'nama_lengkap', 'no_hp_whatsapp'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function anak() // Relasi ke siswa
    {
        return $this->belongsToMany(Siswa::class, 'orang_tua_siswa', 'orang_tua_id', 'siswa_id')
                    ->withPivot('status_hubungan');
    }
}
