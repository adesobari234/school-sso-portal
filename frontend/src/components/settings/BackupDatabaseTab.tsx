"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

interface BackupFile {
  filename: string;
  size_readable: string;
  created_at: string;
}

export default function BackupDatabaseTab() {
  const { toast, confirm } = useNotification();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat daftar backup.");
      setBackups(data.backups || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar backup.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat backup database.");

      toast.success(data.message || "Backup database berhasil dibuat.");
      fetchBackups();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat membuat backup.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/backups/${encodeURIComponent(filename)}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Gagal mengunduh file backup.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh file.");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDelete = async (filename: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Arsip Backup?",
      message: `Yakin ingin menghapus file "${filename}" secara permanen dari server?`,
      confirmText: "Ya, Hapus",
      variant: "danger",
    });

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/backups/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus file backup.");

      toast.success(data.message || "File backup berhasil dihapus.");
      fetchBackups();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus file.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Cadangan Database Sistem</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Mencadangkan seluruh data aplikasi (SSO, Mutaba&apos;ah, dan seluruh modul lainnya). Sistem otomatis menyimpan 30 arsip terbaru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isCreating ? "Memproses Backup..." : "+ Buat Backup Sekarang"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama File Backup</th>
                <th className="px-5 py-3 font-semibold">Ukuran</th>
                <th className="px-5 py-3 font-semibold">Waktu Dibuat</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                    Memuat arsip backup...
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                    Belum ada file backup. Klik <strong>Buat Backup Sekarang</strong> untuk memulai.
                  </td>
                </tr>
              ) : (
                backups.map((item) => (
                  <tr key={item.filename} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-slate-800">
                      {item.filename}
                    </td>
                    <td className="px-5 py-3 text-xs">{item.size_readable}</td>
                    <td className="px-5 py-3 text-xs">{item.created_at}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.filename)}
                          disabled={downloadingFile === item.filename}
                          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                        >
                          {downloadingFile === item.filename ? "Mengunduh..." : "Unduh"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.filename)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}