"use client";

import { useEffect, useState } from "react";

export default function PlottingMusyrifPage() {
  const [guruList, setGuruList] = useState<any[]>([]);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [selectedMusyrifId, setSelectedMusyrifId] = useState<string>("");
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [resGuru, resSantri] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/santri-binaan`, { headers }),
      ]);

      if (resGuru.ok) {
        setGuruList(await resGuru.json());
      }
      if (resSantri.ok) {
        const dataSantri = await resSantri.json();
        setSantriList(dataSantri.santri || []);
      }
    } catch (err) {
      console.error("Gagal memuat data plotting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSiswa = (id: number) => {
    if (selectedSiswaIds.includes(id)) {
      setSelectedSiswaIds(selectedSiswaIds.filter((item) => item !== id));
    } else {
      setSelectedSiswaIds([...selectedSiswaIds, id]);
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMusyrifId) {
      alert("Pilih Musyrif terlebih dahulu.");
      return;
    }
    if (selectedSiswaIds.length === 0) {
      alert("Centang minimal satu santri yang akan dipasangkan.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/assign-musyrif`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          musyrif_id: Number(selectedMusyrifId),
          siswa_ids: selectedSiswaIds,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan penugasan musyrif");

      alert("Penugasan Musyrif berhasil diperbarui!");
      setSelectedSiswaIds([]);
      fetchData(); // Muat ulang daftar agar nama musyrif terbaru langsung terlihat
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSantri = santriList.filter((s) =>
    s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.nisn).includes(searchQuery)
  );

  if (isLoading) return <div className="p-6 text-slate-500">Memuat data santri & musyrif...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Plotting Santri – Musyrif</h1>
        <p className="text-sm text-slate-500">
          Pasangkan santri dengan Guru / Musyrif pembina asrama yang bertanggung jawab mengisi mutaba&apos;ah harian.
        </p>
      </div>

      <form
        onSubmit={handleSimpan}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="w-full max-w-md">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              1. Pilih Musyrif / Pembina Asrama
            </label>
            <select
              value={selectedMusyrifId}
              onChange={(e) => setSelectedMusyrifId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Guru / Musyrif --</option>
              {guruList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama_lengkap} (NIP: {g.nip || "-"})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : `Pasangkan Santri Terpilih (${selectedSiswaIds.length})`}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-semibold text-slate-700">
            2. Centang Santri Binaan
          </label>
          <input
            type="text"
            placeholder="Cari nama atau NISN santri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>

        {filteredSantri.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Data santri tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filteredSantri.map((s) => {
              const checked = selectedSiswaIds.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                    checked
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleSiswa(s.id)}
                    className="mt-1 rounded border-slate-300 text-emerald-600"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">{s.nama_lengkap}</p>
                    <p className="text-xs text-slate-400">NISN: {s.nisn}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Musyrif saat ini:{" "}
                      <span className="font-medium text-emerald-700">{s.musyrif}</span>
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </form>
    </div>
  );
}