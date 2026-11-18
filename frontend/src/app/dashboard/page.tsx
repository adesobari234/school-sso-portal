"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || `Error ${response.status}: Gagal memuat data beranda`);
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) return <div className="p-6 text-slate-500">Memuat beranda...</div>;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;

  const roles: string[] = data?.user?.roles || [];
  const isAdmin = roles.includes("Admin");
  const isGuru = roles.includes("Guru");
  const isSiswa = roles.includes("Siswa");
  const isOrangTua = roles.includes("Orang Tua");

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Selamat Datang, {data?.user?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Portal Akademik & Kesantrian Terpadu
            </p>
          </div>
          <div className="flex gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DAFTAR APLIKASI / SISTEM SSO */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Daftar Sistem & Layanan</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Kartu 1: Sistem Mutaba'ah (Aktif untuk semua role) */}
          <Link
            href="/mutabaah"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Aktif
              </span>
              <span className="text-xs text-slate-400 group-hover:text-emerald-600">Buka Sistem &rarr;</span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-800 group-hover:text-emerald-700">
              Sistem Mutaba&apos;ah Santri
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {isAdmin || isGuru
                ? "Pencatatan ibadah & kedisiplinan harian, rekap bulanan, dan evaluasi rapor Wali Bina."
                : "Pantau capaian ibadah harian, persentase pekanan (>90%), dan rekap semester."}
            </p>
          </Link>

          {/* Kartu 2: Sistem Perizinan Pulang (Tahap Berikutnya) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 opacity-80">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Tahap Berikutnya
              </span>
              <span className="text-xs text-slate-400">Syarat Mutaba&apos;ah &gt; 90%</span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-700">Sistem Perizinan Pulang</h3>
            <p className="mt-1 text-xs text-slate-500">
              Pengajuan & persetujuan izin pulang akhir pekan (Sabtu siang – Minggu sore) terintegrasi skor Mutaba&apos;ah.
            </p>
          </div>

          {/* Kartu 3: Manajemen Asrama (Tahap Berikutnya) */}
          {(isAdmin || isGuru) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 opacity-80">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  Segera Hadir
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-700">Manajemen Kamar Asrama</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pengelolaan kapasitas kamar asrama, penempatan santri, dan wali kamar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TAMPILAN 1: ADMIN */}
      {isAdmin && data?.stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Siswa Aktif</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.stats.total_siswa}</p>
            <Link href="/dashboard/siswa" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Kelola Data Siswa &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Guru / Pengajar</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.stats.total_guru}</p>
            <Link href="/dashboard/guru" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Kelola Data Guru &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Orang Tua / Wali</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data.stats.total_orang_tua}</p>
            <Link href="/dashboard/orangtua" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Kelola Orang Tua &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* TAMPILAN 2: GURU */}
      {isGuru && !isAdmin && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Profil Pengajar</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><span className="font-medium text-slate-800">NIP:</span> {data?.guru?.nip || "-"}</p>
              <p><span className="font-medium text-slate-800">Nama:</span> {data?.guru?.nama_lengkap}</p>
              <p><span className="font-medium text-slate-800">No. HP:</span> {data?.guru?.no_hp || "-"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Jumlah Siswa Terdaftar</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{data?.stats?.total_siswa ?? 0}</p>
            <Link href="/dashboard/siswa" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Lihat Direktori Siswa &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* TAMPILAN 3: SISWA */}
      {isSiswa && data?.siswa && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Kartu Identitas Siswa</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><span className="font-medium text-slate-800">NISN:</span> {data.siswa.nisn}</p>
              <p><span className="font-medium text-slate-800">Nama Lengkap:</span> {data.siswa.nama_lengkap}</p>
              <p><span className="font-medium text-slate-800">Tahun Angkatan:</span> {data.siswa.angkatan}</p>
              <p><span className="font-medium text-slate-800">ID Kamar Asrama:</span> {data.siswa.kamar_asrama_id || "Belum ditentukan"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Orang Tua / Wali Terhubung</h2>
            {data.siswa.orang_tua && data.siswa.orang_tua.length > 0 ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.siswa.orang_tua.map((ot: any) => (
                  <li key={ot.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{ot.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">WA: {ot.no_hp_whatsapp || "-"}</p>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {ot.pivot?.status_hubungan}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Belum ada data orang tua yang ditautkan oleh Admin.</p>
            )}
          </div>
        </div>
      )}

      {/* TAMPILAN 4: ORANG TUA */}
      {isOrangTua && data?.orang_tua && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Profil Orang Tua / Wali</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <p><span className="font-medium text-slate-800">NIK:</span> {data.orang_tua.nik}</p>
              <p><span className="font-medium text-slate-800">Nama:</span> {data.orang_tua.nama_lengkap}</p>
              <p><span className="font-medium text-slate-800">No. WhatsApp:</span> {data.orang_tua.no_hp_whatsapp || "-"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Data Putra / Putri di Asrama</h2>
            {data.orang_tua.siswa && data.orang_tua.siswa.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.orang_tua.siswa.map((anak: any) => (
                  <div key={anak.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">{anak.nama_lengkap}</h3>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Status: {anak.pivot?.status_hubungan}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <p>NISN: {anak.nisn}</p>
                      <p>Angkatan: {anak.angkatan}</p>
                      <p>ID Kamar Asrama: {anak.kamar_asrama_id || "Belum ditentukan"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Belum ada data siswa yang dihubungkan dengan akun Anda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}