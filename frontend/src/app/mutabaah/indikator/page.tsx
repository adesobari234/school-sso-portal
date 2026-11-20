"use client";

import { useEffect, useState } from "react";

export default function MasterIndikatorPage() {
  const [activeTab, setActiveTab] = useState<"indikator" | "kategori">("indikator");
  const [indikatorList, setIndikatorList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State Indikator
  const [editIndikatorId, setEditIndikatorId] = useState<number | null>(null);
  const [namaIndikator, setNamaIndikator] = useState("");
  const [kategori, setKategori] = useState("");
  const [bobotNilai, setBobotNilai] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Form State Kategori
  const [editKategoriId, setEditKategoriId] = useState<number | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [urutanKategori, setUrutanKategori] = useState<number>(1);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

      const [resInd, resKat] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori-mutabaah`, { headers }),
      ]);

      if (resInd.ok) setIndikatorList(await resInd.json());
      if (resKat.ok) {
        const katData = await resKat.json();
        setKategoriList(katData);
        if (katData.length > 0 && !kategori) {
          setKategori(katData[0].nama_kategori);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- HANDLER INDIKATOR ---
  const resetFormIndikator = () => {
    setEditIndikatorId(null);
    setNamaIndikator("");
    setKategori(kategoriList[0]?.nama_kategori || "");
    setBobotNilai(10);
    setIsActive(true);
  };

  const handleSimpanIndikator = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editIndikatorId
      ? `${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah/${editIndikatorId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah`;

    const res = await fetch(url, {
      method: editIndikatorId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        nama_indikator: namaIndikator,
        kategori,
        bobot_nilai: Number(bobotNilai),
        is_active: isActive,
      }),
    });

    if (res.ok) {
      resetFormIndikator();
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.message || "Gagal menyimpan indikator");
    }
  };

  const handleDeleteIndikator = async (id: number) => {
    if (!confirm("Hapus indikator ini?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchAll();
  };

  // --- HANDLER KATEGORI ---
  const resetFormKategori = () => {
    setEditKategoriId(null);
    setNamaKategori("");
    setUrutanKategori(kategoriList.length + 1);
  };

  const handleSimpanKategori = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editKategoriId
      ? `${process.env.NEXT_PUBLIC_API_URL}/kategori-mutabaah/${editKategoriId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/kategori-mutabaah`;

    const res = await fetch(url, {
      method: editKategoriId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        nama_kategori: namaKategori,
        urutan: Number(urutanKategori),
      }),
    });

    if (res.ok) {
      resetFormKategori();
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.message || "Gagal menyimpan kategori");
    }
  };

  const handleDeleteKategori = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kategori-mutabaah/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (res.ok) {
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.message || "Kategori tidak dapat dihapus");
    }
  };

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Memuat Master Indikator...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Indikator &amp; Kategori</h1>
        <p className="text-sm text-slate-500">
          Sesuaikan aspek penilaian dan poin kebiasaan harian berdasarkan kurikulum asrama.
        </p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("indikator")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "indikator"
              ? "bg-emerald-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Daftar Indikator ({indikatorList.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("kategori");
            setUrutanKategori(kategoriList.length + 1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "kategori"
              ? "bg-emerald-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Kelola Kategori ({kategoriList.length})
        </button>
      </div>

      {/* TAB 1: MASTER INDIKATOR */}
      {activeTab === "indikator" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSimpanIndikator}
            className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-bold text-slate-800">
              {editIndikatorId ? "Edit Indikator" : "Tambah Indikator Baru"}
            </h2>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Indikator</label>
              <input
                type="text"
                required
                placeholder="Contoh: Shalat Subuh Berjamaah"
                value={namaIndikator}
                onChange={(e) => setNamaIndikator(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Kategori Kurikulum</label>
              <select
                required
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.nama_kategori}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Bobot Poin</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={bobotNilai}
                onChange={(e) => setBobotNilai(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              Aktif digunakan dalam checklist harian
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {editIndikatorId ? "Perbarui" : "Simpan Indikator"}
              </button>
              {editIndikatorId && (
                <button
                  type="button"
                  onClick={resetFormIndikator}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Indikator</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Bobot</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {indikatorList.map((ind) => (
                    <tr key={ind.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{ind.nama_indikator}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {ind.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-3">{ind.bobot_nilai}</td>
                      <td className="px-5 py-3">
                        {ind.is_active ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="space-x-3 px-5 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditIndikatorId(ind.id);
                            setNamaIndikator(ind.nama_indikator);
                            setKategori(ind.kategori);
                            setBobotNilai(ind.bobot_nilai);
                            setIsActive(Boolean(ind.is_active));
                          }}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIndikator(ind.id)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA KATEGORI */}
      {activeTab === "kategori" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSimpanKategori}
            className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-bold text-slate-800">
              {editKategoriId ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Kategori</label>
              <input
                type="text"
                required
                placeholder="Contoh: Tahfidz & Bahasa"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Urutan Tampil Rapor</label>
              <input
                type="number"
                min={1}
                required
                value={urutanKategori}
                onChange={(e) => setUrutanKategori(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {editKategoriId ? "Perbarui" : "Simpan Kategori"}
              </button>
              {editKategoriId && (
                <button
                  type="button"
                  onClick={resetFormKategori}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Urutan</th>
                    <th className="px-5 py-3 font-semibold">Nama Kategori</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kategoriList.map((kat) => (
                    <tr key={kat.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">{kat.urutan}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{kat.nama_kategori}</td>
                      <td className="space-x-3 px-5 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditKategoriId(kat.id);
                            setNamaKategori(kat.nama_kategori);
                            setUrutanKategori(kat.urutan);
                          }}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteKategori(kat.id)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}