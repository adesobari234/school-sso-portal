<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    use HasFactory;
    protected $table = 'guru';
    protected $fillable = ['user_id', 'nip', 'nama_lengkap', 'no_hp'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function siswaBinaan()
    {
        return $this->hasMany(Siswa::class, 'musyrif_id');
    }
}
