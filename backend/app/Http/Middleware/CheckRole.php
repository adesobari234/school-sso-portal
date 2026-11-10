<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil semua nama_role yang dimiliki user saat ini (dalam bentuk array)
        $userRoles = $request->user()->roles->pluck('nama_role')->toArray();

        // Cek apakah ada irisan antara role user dengan role yang diizinkan di route
        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return $next($request); // Loloskan request
            }
        }

        // Jika tidak ada yang cocok, tolak aksesnya
        return response()->json([
            'message' => 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.'
        ], 403);
    }
}
