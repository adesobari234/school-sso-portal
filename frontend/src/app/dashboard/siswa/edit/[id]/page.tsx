"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil ID dari URL
  const id = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nisn: "",
    nama_lengkap: "",
    angkatan: "",
    kamar_asrama_id: "",
  });

  // Ambil data lama saat halaman dimuat
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Data tidak ditemukan");
        const data = await response.json();
        
        setFormData({
          nisn: data.nisn,
          nama_lengkap: data.nama_lengkap,
          angkatan: data.angkatan,
          kamar_asrama_id: data.kamar_asrama_id || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSiswa();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
        method: "PUT", // Gunakan metode PUT untuk update
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal memperbarui siswa");
      }

      router.push("/dashboard/siswa");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-6">Memuat data form...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Edit Data Siswa</h1>
        <Link href="/dashboard/siswa" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Batal
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">NISN</label>
              <input type="text" name="nisn" required value={formData.nisn} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" required value={formData.nama_lengkap} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tahun Angkatan</label>
              <input type="number" name="angkatan" required value={formData.angkatan} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ID Kamar</label>
              <input type="number" name="kamar_asrama_id" value={formData.kamar_asrama_id} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70">
              {isLoading ? "Menyimpan Perubahan..." : "Update Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}