<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\GuruController;
use App\Http\Controllers\Api\OrangTuaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Endpoint publik
Route::post('/login', [AuthController::class, 'login']);

// Endpoint terproteksi Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load(['roles', 'guru', 'siswa', 'orangTua']);
        return $user;
    });

    // ----------------------------------------------------
    // MODULE: DATA SISWA
    // ----------------------------------------------------
    // Hak akses: Admin & Guru (Hanya bisa baca)
    Route::middleware('role:Admin,Guru')->group(function () {
        Route::get('/siswa', [SiswaController::class, 'index']);
        Route::get('/siswa/{id}', [SiswaController::class, 'show']);
    });

    // Hak akses: KHUSUS Admin (Bisa modifikasi)
    Route::middleware('role:Admin')->group(function () {
        Route::post('/siswa', [SiswaController::class, 'store']);
        Route::put('/siswa/{id}', [SiswaController::class, 'update']);
        Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);

        // Guru CRUD (SHOW, POST, PUT, DELETE)
        Route::get('/guru', [GuruController::class, 'index']);
        Route::get('/guru/{id}', [GuruController::class, 'show']);
        Route::post('/guru', [GuruController::class, 'store']);
        Route::put('/guru/{id}', [GuruController::class, 'update']);
        Route::delete('/guru/{id}', [GuruController::class, 'destroy']);
        
    
        // Orang Tua CRUD (Full API - Hanya Admin)
        Route::get('/orangtua', [OrangTuaController::class, 'index']);
        Route::get('/orangtua/{id}', [OrangTuaController::class, 'show']);
        Route::post('/orangtua', [OrangTuaController::class, 'store']);
        Route::put('/orangtua/{id}', [OrangTuaController::class, 'update']);
        Route::delete('orangtua/{id}', [OrangTuaController::class, 'destroy']);
    });
    
});
