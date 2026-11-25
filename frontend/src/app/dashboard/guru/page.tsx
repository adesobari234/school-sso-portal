"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { useNotification } from "@/components/NotificationProvider";

export default function DataGuruPage() {
  const { toast, confirm } = useNotification();
  const [guru, setGuru] = useState<any[]>([]);
  const [searchGuru, setSearchGuru] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Gagal mengambil data guru");
        const data = await response.json();
        setGuru(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuru();
  }, []);

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Hapus Data Guru?",
      message: "Yakin ingin menghapus data guru ini beserta akun loginnya? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Ya, Hapus",
      variant: "danger",
    });

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus data guru");

      setGuru(guru.filter((item) => item.id !== id));
      toast.success("Data guru beserta akun loginnya berhasil dihapus.");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus data.");
    }
  };

  const filteredGuru = guru.filter(
    (u) =>
      String(u.nama_lengkap || "").toLowerCase().includes(searchGuru.toLowerCase()) ||
      String(u.nip || "").toLowerCase().includes(searchGuru.toLowerCase())
  );

  const paginatedGuru = filteredGuru.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Guru</h1>
        <Link href="/dashboard/guru/tambah" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Tambah Guru
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800">Daftar Guru</h2>
        <input
          type="text"
          placeholder="Cari nama atau NIP guru..."
          value={searchGuru}
          onChange={(e) => {
            setSearchGuru(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">NIP</th>
                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold">No HP</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : guru.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Data siswa tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedGuru.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nip}</td>
                    <td className="px-6 py-4">{item.nama_lengkap}</td>
                    <td className="px-6 py-4">{item.no_hp || "-"}</td>
                    <td className="px-6 py-4 space-x-3">
                      <Link href={`/dashboard/guru/edit/${item.id}`} className="text-blue-600 hover:underline font-medium">Edit</Link>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline font-medium">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredGuru.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}