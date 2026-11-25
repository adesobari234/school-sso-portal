"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function MasterKelasPage() {
  const { toast, confirm } = useNotification();

  const [kelasList, setKelasList] = useState<any[]>([]);
  const [guruList, setGuruList] = useState<any[]>([]);
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Form Kelas
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_kelas: "",
    tingkat: "7",
    wali_kelas_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // State Modal Plotting Siswa
  const [plottingKelas, setPlottingKelas] = useState<any>(null);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<number[]>([]);
  const [searchSiswa, setSearchSiswa] = useState("");
  const [isSavingPlot, setIsSavingPlot] = useState(false);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [resKelas, resGuru, resSiswa] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa`, { headers }),
      ]);

      if (resKelas.ok) setKelasList(await resKelas.json());
      if (resGuru.ok) setGuruList(await resGuru.json());
      if (resSiswa.ok) {
        const dataSiswa = await resSiswa.json();
        setSiswaList(Array.isArray(dataSiswa) ? dataSiswa : dataSiswa.data || []);
      }
    } catch (err) {
      toast.error("Gagal memuat data Master Kelas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ nama_kelas: "", tingkat: "7", wali_kelas_id: "" });
    setIsFormOpen(true);
  };

  const openEditModal = (kelas: any) => {
    setEditingId(kelas.id);
    setFormData({
      nama_kelas: kelas.nama_kelas,
      tingkat: kelas.tingkat,
      wali_kelas_id: kelas.wali_kelas_id ? String(kelas.wali_kelas_id) : "",
    });
    setIsFormOpen(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/kelas/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/kelas`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          nama_kelas: formData.nama_kelas,
          tingkat: formData.tingkat,
          wali_kelas_id: formData.wali_kelas_id ? Number(formData.wali_kelas_id) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data kelas.");

      toast.success(data.message || "Data kelas berhasil disimpan.");
      setIsFormOpen(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKelas = async (kelas: any) => {
    const ok = await confirm({
      title: "Hapus Kelas?",
      message: `Yakin ingin menghapus kelas "${kelas.nama_kelas}"? Siswa di dalamnya tidak ikut terhapus, hanya status kelasnya menjadi kosong.`,
      confirmText: "Ya, Hapus",
      variant: "danger",
    });

    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas/${kelas.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus kelas.");

      toast.success(data.message || "Kelas berhasil dihapus.");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openPlottingModal = (kelas: any) => {
    setPlottingKelas(kelas);
    setSearchSiswa("");
    // Centang otomatis siswa yang saat ini sudah berada di kelas tersebut
    const currentMemberIds = siswaList
      .filter((s) => s.kelas_id === kelas.id)
      .map((s) => s.id);
    setSelectedSiswaIds(currentMemberIds);
  };

  const toggleSiswa = (id: number) => {
    setSelectedSiswaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSavePlotting = async () => {
    if (!plottingKelas) return;
    setIsSavingPlot(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kelas/${plottingKelas.id}/assign-siswa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ siswa_ids: selectedSiswaIds }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan penempatan siswa.");

      toast.success(data.message || "Penempatan siswa berhasil disimpan.");
      setPlottingKelas(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPlot(false);
    }
  };

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.nama_lengkap.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      String(s.nisn || "").includes(searchSiswa)
  );

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Memuat data kelas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Kelas & Rombel</h1>
          <p className="text-sm text-slate-500">
            Kelola daftar kelas, wali kelas, dan penempatan siswa
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah Kelas
        </button>
      </div>

      {/* Tabel Daftar Kelas */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama Kelas</th>
                <th className="px-5 py-3 font-semibold">Tingkat</th>
                <th className="px-5 py-3 font-semibold">Wali Kelas</th>
                <th className="px-5 py-3 text-center font-semibold">Jumlah Siswa</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {kelasList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Belum ada data kelas. Klik <strong>+ Tambah Kelas</strong> untuk membuat rombel baru.
                  </td>
                </tr>
              ) : (
                kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{k.nama_kelas}</td>
                    <td className="px-5 py-3">Tingkat {k.tingkat}</td>
                    <td className="px-5 py-3">
                      {k.wali_kelas ? k.wali_kelas.nama_lengkap : <span className="text-slate-400">Belum ditentukan</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {k.siswa_count} Siswa
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openPlottingModal(k)}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Atur Siswa
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(k)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteKelas(k)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Kelas */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </h2>
            <form onSubmit={handleSaveKelas} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VII A / X IPA 1"
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Tingkat</label>
                <select
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {["7", "8", "9", "10", "11", "12"].map((t) => (
                    <option key={t} value={t}>
                      Tingkat {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Wali Kelas (Opsional)
                </label>
                <select
                  value={formData.wali_kelas_id}
                  onChange={(e) => setFormData({ ...formData, wali_kelas_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Belum Ditentukan --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Plotting Siswa ke Kelas */}
      {plottingKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-slate-800">
                Atur Siswa — Kelas {plottingKelas.nama_kelas}
              </h2>
              <p className="text-xs text-slate-500">
                Centang siswa yang masuk ke rombel ini ({selectedSiswaIds.length} terpilih).
              </p>
            </div>

            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={searchSiswa}
              onChange={(e) => setSearchSiswa(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />

            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredSiswa.map((s) => {
                const isChecked = selectedSiswaIds.includes(s.id);
                const kelasLain =
                  s.kelas_id && s.kelas_id !== plottingKelas.id
                    ? kelasList.find((k) => k.id === s.kelas_id)?.nama_kelas
                    : null;

                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSiswa(s.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.nama_lengkap}</p>
                        <p className="text-xs text-slate-400">NISN: {s.nisn || "-"}</p>
                      </div>
                    </div>
                    {kelasLain && (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Saat ini: {kelasLain}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPlottingKelas(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePlotting}
                disabled={isSavingPlot}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSavingPlot ? "Menyimpan..." : "Simpan Penempatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}