"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditGuruPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nip: "",
    nama_lengkap: "",
    no_hp: "",
  });

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Data tidak ditemukan");
        const data = await response.json();
        
        setFormData({
          nip: data.nip,
          nama_lengkap: data.nama_lengkap,
          no_hp: data.no_hp || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchGuru();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/${id}`, {
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
        throw new Error(data.message || "Gagal memperbarui guru");
      }

      router.push("/dashboard/guru");
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
        <h1 className="text-2xl font-bold text-slate-800">Edit Data Guru</h1>
        <Link href="/dashboard/guru" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Batal
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">NIP</label>
              <input type="text" name="nip" required value={formData.nip} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" required value={formData.nama_lengkap} onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">No. HP</label>
            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange}
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