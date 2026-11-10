<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswa';
    protected $fillable = ['user_id', 'nisn', 'nama_lengkap', 'angkatan', 'kamar_asrama_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function orangTua()
    {
        return $this->belongsToMany(OrangTua::class, 'orang_tua_siswa', 'siswa_id', 'orang_tua_id')
                    ->withPivot('status_hubungan');
    }
}
