"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditOrangTuaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nik: "",
    nama_lengkap: "",
    no_hp_whatsapp: "",
  });

  useEffect(() => {
    const fetchOrangTua = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orangtua/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Data tidak ditemukan");
        const data = await response.json();
        
        setFormData({
          nik: data.nik,
          nama_lengkap: data.nama_lengkap,
          no_hp_whatsapp: data.no_hp_whatsapp || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOrangTua();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orangtua/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal memperbarui data");
      }

      router.push("/dashboard/orangtua");
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
        <h1 className="text-2xl font-bold text-slate-800">Edit Data Orang Tua</h1>
        <Link href="/dashboard/orangtua" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Batal
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">NIK</label>
              <input type="text" name="nik" required value={formData.nik} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" required value={formData.nama_lengkap} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">No. HP / WA</label>
            <input type="text" name="no_hp_whatsapp" value={formData.no_hp_whatsapp} onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70">
              {isLoading ? "Menyimpan Perubahan..." : "Update Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}