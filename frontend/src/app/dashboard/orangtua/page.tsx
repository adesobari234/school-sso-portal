"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DataGuruPage() {
  const [OrangTua, setOrangTua] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrangTua = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orangtua`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Gagal mengambil data orang tua");
        const data = await response.json();
        setOrangTua(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrangTua();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data orang tua ini beserta akun loginnya?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orangtua/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal menghapus data");
      setOrangTua(OrangTua.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Orang Tua</h1>
        <Link href="/dashboard/orangtua/tambah" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Tambah Orang Tua
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">NIK</th>
                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold">No HP / WA</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : OrangTua.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada data orang tua.</td></tr>
              ) : (
                OrangTua.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nik}</td>
                    <td className="px-6 py-4">{item.nama_lengkap}</td>
                    <td className="px-6 py-4">{item.no_hp_whatsapp || "-"}</td>
                    <td className="px-6 py-4 space-x-3">
                      <Link href={`/dashboard/orangtua/edit/${item.id}`} className="text-blue-600 hover:underline font-medium">Edit</Link>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline font-medium">Hapus</button>
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