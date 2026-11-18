"use client";

import { useEffect, useState } from "react";

export default function MasterIndikatorPage() {
  const [indikatorList, setIndikatorList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama_indikator: "",
    kategori: "Ibadah",
    bobot_nilai: 1,
    is_active: true,
  });

  const fetchIndikator = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Gagal memuat daftar indikator");
      const data = await res.json();
      setIndikatorList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndikator();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal menambahkan indikator");
      }

      const result = await res.json();
      setIndikatorList([...indikatorList, result.data]);
      setForm({
        nama_indikator: "",
        kategori: "Ibadah",
        bobot_nilai: 1,
        is_active: true,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHapus = async (id: number) => {
    if (!confirm("Yakin ingin menghapus indikator ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus indikator");
      setIndikatorList(indikatorList.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Indikator Mutaba&apos;ah</h1>
        <p className="text-sm text-slate-500">
          Kelola poin penilaian kebiasaan harian santri dan kategori rapor Wali Bina.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Tambah Indikator */}
        <form
          onSubmit={handleTambah}
          className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800">Tambah Indikator Baru</h2>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Nama Indikator / Kebiasaan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Shalat Subuh Berjamaah"
              value={form.nama_indikator}
              onChange={(e) => setForm({ ...form, nama_indikator: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Kategori Aspek Rapor
            </label>
            <select
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="Ibadah">Ibadah</option>
              <option value="Kedisiplinan">Kedisiplinan</option>
              <option value="Kebersihan">Kebersihan</option>
              <option value="Akhlak">Akhlak</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Bobot Poin
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={form.bobot_nilai}
              onChange={(e) => setForm({ ...form, bobot_nilai: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "+ Simpan Indikator"}
          </button>
        </form>

        {/* Tabel Daftar Indikator */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama Indikator</th>
                  <th className="px-5 py-3 font-semibold">Kategori</th>
                  <th className="px-5 py-3 font-semibold">Bobot</th>
                  <th className="px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                      Memuat data indikator...
                    </td>
                  </tr>
                ) : indikatorList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                      Belum ada indikator mutaba&apos;ah. Silakan tambahkan di form samping.
                    </td>
                  </tr>
                ) : (
                  indikatorList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {item.nama_indikator}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-700">
                        {item.bobot_nilai}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleHapus(item.id)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
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
    </div>
  );
}