"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { useNotification } from "@/components/NotificationProvider";
import BackupDatabaseTab from "@/components/settings/BackupDatabaseTab";

export default function PengaturanPortalPage() {
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<"umum" | "akun" | "backup">("umum");
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  // State Konfigurasi Umum
  const [settings, setSettings] = useState({
    nama_sekolah: "",
    tahun_ajaran: "",
    semester_aktif: "ganjil",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // State Manajemen Akun & Reset Password
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 403) {
          setIsForbidden(true);
          return;
        }

        if (!res.ok) throw new Error("Gagal memuat pengaturan");

        const data = await res.json();
        setSettings(data.settings);
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan pengaturan");

      toast.success(data.message || "Pengaturan berhasil disimpan.");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setIsResetting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/users/${resetTarget.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mereset password");

      toast.success(data.message || "Password berhasil direset.");
      setResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mereset password.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Memuat pengaturan portal...</div>;
  }

  if (isForbidden) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-bold">Akses Ditolak</p>
        <p className="mt-1">Halaman pengaturan hanya dapat diakses oleh Administrator.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-semibold underline">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Portal SSO</h1>
        <p className="text-sm text-slate-500">
          Kelola identitas instansi, periode tahun ajaran aktif, dan reset kata sandi akun pengguna.
        </p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("umum")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "umum"
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          Konfigurasi Portal &amp; Akademik
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("akun")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "akun"
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          Manajemen Akun &amp; Reset Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backup")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "backup"
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          Backup Database
        </button>
      </div>

      {/* TAB 1: KONFIGURASI PORTAL & PERIODE AKADEMIK */}
      {activeTab === "umum" && (
        <form
          onSubmit={handleSaveSettings}
          className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nama Sekolah / Pesantren
            </label>
            <input
              type="text"
              required
              value={settings.nama_sekolah}
              onChange={(e) => setSettings({ ...settings, nama_sekolah: e.target.value })}
              placeholder="Contoh: Sekolah & Pesantren Terpadu"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Digunakan sebagai Kop Surat pada cetakan rapor dan laporan resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                required
                value={settings.tahun_ajaran}
                onChange={(e) => setSettings({ ...settings, tahun_ajaran: e.target.value })}
                placeholder="2026/2027"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Semester Aktif
              </label>
              <select
                value={settings.semester_aktif}
                onChange={(e) => setSettings({ ...settings, semester_aktif: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            <strong>Perhatian:</strong> Mengubah Tahun Ajaran atau Semester aktif akan otomatis memfilter data operasional yang tampil di seluruh aplikasi (Mutaba&apos;ah, Kamar Asrama, dan Perizinan).
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAJEMEN AKUN & RESET PASSWORD */}
      {activeTab === "akun" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-800">Daftar Akun Pengguna SSO</h2>
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Nama Pengguna</th>
                      <th className="px-5 py-3 font-semibold">Email Login</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="px-5 py-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                          Akun tidak ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50 ${resetTarget?.id === u.id ? "bg-blue-50/60" : ""}`}
                        >
                          <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                          <td className="px-5 py-3 text-slate-500">{u.email}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.roles?.map((r: any) => (
                                <span
                                  key={r.id}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                                >
                                  {r.nama_role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setResetTarget(u);
                                setNewPassword("");
                              }}
                              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Reset Password
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Panel Reset Password */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {!resetTarget ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Klik tombol <strong>Reset Password</strong> pada salah satu akun di tabel untuk mengatur kata sandi baru.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400">Reset Password Akun</p>
                  <h3 className="text-base font-bold text-slate-800">{resetTarget.name}</h3>
                  <p className="text-xs text-slate-500">{resetTarget.email}</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Password Baru (Minimal 6 karakter)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    placeholder="Masukkan password baru..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isResetting ? "Memproses..." : "Simpan Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetTarget(null)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {activeTab === "backup" && <BackupDatabaseTab />}
    </div>
  );
}