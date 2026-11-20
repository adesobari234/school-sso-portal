<?php

namespace App\Traits;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Model
 * @method static void creating(\Closure|string $callback)
 */
trait FilterPeriodeAkademik
{
    protected static function bootFilterPeriodeAkademik(): void
    {
        static::creating(function (Model $model) {
            if (empty($model->getAttribute('tahun_ajaran'))) {
                $model->setAttribute('tahun_ajaran', Setting::getValue('tahun_ajaran', '2026/2027'));
            }
            if (empty($model->getAttribute('semester'))) {
                $model->setAttribute('semester', Setting::getValue('semester_aktif', 'ganjil'));
            }
        });
    }

    public function scopePeriodeAktif(Builder $query): Builder
    {
        $tahunAktif = Setting::getValue('tahun_ajaran', '2026/2027');
        $semesterAktif = Setting::getValue('semester_aktif', 'ganjil');

        return $query->where('tahun_ajaran', $tahunAktif)
                     ->where('semester', $semesterAktif);
    }

    public function scopeByPeriode(Builder $query, ?string $tahunAjaran = null, ?string $semester = null): Builder
    {
        $tahun = $tahunAjaran ?: Setting::getValue('tahun_ajaran', '2026/2027');
        $sem = $semester ?: Setting::getValue('semester_aktif', 'ganjil');

        return $query->where('tahun_ajaran', $tahun)
                     ->where('semester', $sem);
    }
}