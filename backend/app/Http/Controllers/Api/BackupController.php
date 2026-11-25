<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        $roles = $request->user()->roles->pluck('nama_role')->toArray();
        return in_array('Admin', $roles);
    }

    public function index(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Hanya Admin yang dapat mengakses backup database.'], 403);
        }

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            return response()->json(['backups' => []]);
        }

        $files = collect(File::files($backupDir))
            ->filter(fn ($file) => str_ends_with($file->getFilename(), '.sql.gz'))
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->map(function ($file) {
                return [
                    'filename' => $file->getFilename(),
                    'size_bytes' => $file->getSize(),
                    'size_readable' => $this->formatBytes($file->getSize()),
                    'created_at' => date('d M Y, H:i', $file->getMTime()),
                ];
            })
            ->values();

        return response()->json(['backups' => $files]);
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $exitCode = Artisan::call('backup:database');

        if ($exitCode !== 0) {
            return response()->json([
                'message' => 'Gagal membuat backup. Pastikan mysqldump tersedia di server.',
                'detail' => trim(Artisan::output()),
            ], 500);
        }

        return response()->json([
            'message' => 'Backup database baru berhasil dibuat.',
        ]);
    }

    public function download(Request $request, string $filename)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Cegah directory traversal
        $safeName = basename($filename);
        $path = storage_path('app/backups/' . $safeName);

        if (!File::exists($path)) {
            return response()->json(['message' => 'File backup tidak ditemukan.'], 404);
        }

        return response()->download($path, $safeName, [
            'Content-Type' => 'application/gzip',
        ]);
    }

    public function destroy(Request $request, string $filename)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $safeName = basename($filename);
        $path = storage_path('app/backups/' . $safeName);

        if (!File::exists($path)) {
            return response()->json(['message' => 'File backup tidak ditemukan.'], 404);
        }

        File::delete($path);

        return response()->json([
            'message' => "File backup {$safeName} berhasil dihapus.",
        ]);
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        return round($bytes / 1024, 2) . ' KB';
    }
}