"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahSiswaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nisn: "",
    nama_lengkap: "",
    angkatan: new Date().getFullYear().toString(),
    kamar_asrama_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Menangkap error validasi dari Laravel
        throw new Error(data.message || "Gagal menambahkan siswa");
      }

      // Kembali ke halaman tabel jika sukses
      router.push("/dashboard/siswa");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tambah Data Siswa</h1>
        <Link href="/dashboard/siswa" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Kembali
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">NISN</label>
              <input type="text" name="nisn" required value={formData.nisn} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" required value={formData.nama_lengkap} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email Login</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password Login</label>
              <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tahun Angkatan</label>
              <input type="number" name="angkatan" required value={formData.angkatan} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ID Kamar (Opsional)</label>
              <input type="number" name="kamar_asrama_id" value={formData.kamar_asrama_id} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70">
              {isLoading ? "Menyimpan..." : "Simpan Data Siswa"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}