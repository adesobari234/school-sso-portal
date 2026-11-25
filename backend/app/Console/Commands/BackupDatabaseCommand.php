<?php

namespace App\Console\Commands;

use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membuat cadangan penuh database ke format terkompresi (.sql.gz)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        // Ambil label periode akademik aktif untuk penamaan file
        $tahunAjaran = str_replace('/', '-', Setting::getValue('tahun_ajaran', '2026-2027'));
        $semester = strtolower(Setting::getValue('semester_aktif', 'ganjil'));
        $timestamp = now()->format('Ymd_His');

        $fileName = "backup_{$tahunAjaran}_{$semester}_{$timestamp}.sql.gz";
        $fullPath = $backupDir . DIRECTORY_SEPARATOR . $fileName;

        $connection = config('database.default');
        $dbConfig = config("database.connections.{$connection}");

        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? '3306';
        $database = $dbConfig['database'];
        $username = $dbConfig['username'];
        $password = $dbConfig['password'] ?? '';

        // Mendukung path custom di .env (berguna untuk Windows / Laragon / XAMPP)
        $mysqldumpPath = env('MYSQLDUMP_PATH', 'mysqldump');

        $command = [
            $mysqldumpPath,
            '--host=' . $host,
            '--port=' . $port,
            '--user=' . $username,
            '--single-transaction',
            '--routines',
            '--triggers',
            $database,
        ];

        $env = [
            'SystemRoot' => getenv('SystemRoot') ?: 'C:\\Windows',
            'WINDIR' => getenv('WINDIR') ?: 'C:\\Windows',
            'PATH' => getenv('PATH') ?: '',
        ];
        if ($password !== '') {
            $env['MYSQL_PWD'] = $password;
        }

        $process = new Process($command, null, $env);
        $process->setTimeout(300); // Maksimal 5 menit
        $process->run();

        if (!$process->isSuccessful()) {
            $this->error('Backup gagal: ' . $process->getErrorOutput());
            return self::FAILURE;
        }

        // Kompresi hasil SQL ke .gz menggunakan PHP bawaan
        $compressed = gzencode($process->getOutput(), 9);
        File::put($fullPath, $compressed);

        // Retention Policy: sisakan 30 file backup terbaru saja
        $this->cleanOldBackups($backupDir, 30);

        $this->info("Backup berhasil dibuat: {$fileName}");
        return self::SUCCESS;
    }

    private function cleanOldBackups(string $dir, int $keepLatest): void
    {
        $files = collect(File::files($dir))
            ->filter(fn ($file) => str_ends_with($file->getFilename(), '.sql.gz'))
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->values();

        if ($files->count() > $keepLatest) {
            foreach ($files->slice($keepLatest) as $oldFile) {
                File::delete($oldFile->getPathname());
            }
        }
    }
}
