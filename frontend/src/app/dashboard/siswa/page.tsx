"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DataSiswaPage() {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data siswa");
        
        const data = await response.json();
        setSiswa(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiswa();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data siswa ini beserta akun loginnya?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus data");
      
      // Hapus baris dari state tabel tanpa perlu refresh halaman
      setSiswa(siswa.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Siswa</h1>
        <Link href="/dashboard/siswa/tambah" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          + Tambah Siswa
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">NISN</th>
                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold">Angkatan</th>
                <th className="px-6 py-4 font-semibold">Kamar Asrama</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : siswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                siswa.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nisn}</td>
                    <td className="px-6 py-4">{item.nama_lengkap}</td>
                    <td className="px-6 py-4">{item.angkatan}</td>
                    <td className="px-6 py-4">Kamar {item.kamar_asrama_id || "-"}</td>
                    <td className="px-6 py-4 space-x-3">
                      <Link href={`/dashboard/siswa/edit/${item.id}`} className="font-medium text-blue-600 hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 hover:underline">
                        Hapus
                      </button>
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