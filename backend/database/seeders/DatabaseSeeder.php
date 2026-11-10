<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Guru;
use App\Models\Siswa;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Data Roles
        $roles = [
            ['nama_role' => 'Admin'],
            ['nama_role' => 'Guru'],
            ['nama_role' => 'Siswa'],
            ['nama_role' => 'Orang Tua']
        ];
        foreach ($roles as $role) {
            Role::create($role);
        }

        // Ambil ID dari masing-masing role untuk disambungkan nanti
        $adminRole = Role::where('nama_role', 'Admin')->first();
        $guruRole = Role::where('nama_role', 'Guru')->first();
        $siswaRole = Role::where('nama_role', 'Siswa')->first();

        // 2. Buat Akun Admin
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@sekolah.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $admin->roles()->attach($adminRole->id);

        // 3. Buat Akun & Profil Guru
        $userGuru = User::create([
            'name' => 'Budi Santoso',
            'email' => 'guru@sekolah.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $userGuru->roles()->attach($guruRole->id);
        
        Guru::create([
            'user_id' => $userGuru->id,
            'nip' => '198001012005011001',
            'nama_lengkap' => 'Budi Santoso, S.Pd.',
            'no_hp' => '081234567890'
        ]);

        // 4. Buat Akun & Profil Siswa
        $userSiswa = User::create([
            'name' => 'Ahmad Fulan',
            'email' => 'siswa@sekolah.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $userSiswa->roles()->attach($siswaRole->id);
        
        Siswa::create([
            'user_id' => $userSiswa->id,
            'nisn' => '0051234567',
            'nama_lengkap' => 'Ahmad Fulan',
            'angkatan' => 2026,
            'kamar_asrama_id' => 101
        ]);
    }
}
