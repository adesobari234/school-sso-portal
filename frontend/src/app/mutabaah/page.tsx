"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RekapMutabaahView from "@/components/mutabaah/RekapMutabaahView";
import Pagination from "@/components/Pagination";

export default function SistemMutabaahPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Siswa / Orang Tua
  const [selectedAnakId, setSelectedAnakId] = useState<number | null>(null);

  // State untuk Input Harian & Notifikasi Terlewat (Musyrif & Admin)
  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState<string>(today);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [searchSantri, setSearchSantri] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [ringkasanTerlewat, setRingkasanTerlewat] = useState<{
    total_hari_terlewat: number;
    detail_tanggal: { tanggal: string; jumlah_santri: number }[];
  }>({ total_hari_terlewat: 0, detail_tanggal: [] });

  const [indikatorList, setIndikatorList] = useState<any[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [statusKehadiran, setStatusKehadiran] = useState<"hadir" | "izin_pulang" | "sakit">("hadir");
  const [catatanHarian, setCatatanHarian] = useState<string>("");
  const [checkedIndikator, setCheckedIndikator] = useState<Record<number, boolean>>({});
  const [isSavingHarian, setIsSavingHarian] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, { headers });
        if (!res.ok) throw new Error("Gagal memuat sesi pengguna");
        const data = await res.json();
        setUserData(data);

        const roles: string[] = data?.user?.roles || [];
        if (roles.includes("Orang Tua") && data?.orang_tua?.siswa?.length > 0) {
          setSelectedAnakId(data.orang_tua.siswa[0].id);
        }

        if (roles.includes("Admin") || roles.includes("Guru")) {
          const resInd = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indikator-mutabaah?active_only=1`, { headers });
          if (resInd.ok) setIndikatorList(await resInd.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, []);

  const fetchSantriBinaan = async (tgl: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/santri-binaan?tanggal=${tgl}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setSantriList(data.santri || []);
        setRingkasanTerlewat(
          data.ringkasan_terlewat || { total_hari_terlewat: 0, detail_tanggal: [] }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const roles: string[] = userData?.user?.roles || [];
    if (roles.includes("Admin") || roles.includes("Guru")) {
      fetchSantriBinaan(tanggal);
    }
  }, [userData, tanggal]);

  const handleSelectSantriForInput = (santri: any) => {
    setSelectedSantri(santri);
    if (santri.data_harian) {
      setStatusKehadiran(santri.data_harian.status_kehadiran);
      setCatatanHarian(santri.data_harian.catatan || "");
      const mapCheck: Record<number, boolean> = {};
      santri.data_harian.details?.forEach((d: any) => {
        mapCheck[d.indikator_id] = Boolean(d.is_tercapai);
      });
      setCheckedIndikator(mapCheck);
    } else {
      setStatusKehadiran("hadir");
      setCatatanHarian("");
      const defaultCheck: Record<number, boolean> = {};
      indikatorList.forEach((ind) => {
        defaultCheck[ind.id] = true;
      });
      setCheckedIndikator(defaultCheck);
    }
  };

  const handleSimpanHarian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;
    setIsSavingHarian(true);

    try {
      const token = localStorage.getItem("token");
      const details = indikatorList.map((ind) => ({
        indikator_id: ind.id,
        is_tercapai: Boolean(checkedIndikator[ind.id]),
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/harian`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          siswa_id: selectedSantri.id,
          tanggal,
          status_kehadiran: statusKehadiran,
          catatan: catatanHarian,
          details: statusKehadiran === "hadir" ? details : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyimpan mutaba'ah");
      }

      alert(`Mutaba'ah ${selectedSantri.nama_lengkap} tanggal ${tanggal} tersimpan!`);
      setSelectedSantri(null);
      fetchSantriBinaan(tanggal);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingHarian(false);
    }
  };

  if (isLoading) return <div className="p-6 text-slate-500">Memuat Sistem Mutaba&apos;ah...</div>;

  const roles: string[] = userData?.user?.roles || [];
  const isAdmin = roles.includes("Admin");
  const isGuru = roles.includes("Guru");
  const isSiswa = roles.includes("Siswa");
  const isOrangTua = roles.includes("Orang Tua");

  const filteredSantri = santriList.filter(
    (s) =>
      s.nama_lengkap.toLowerCase().includes(searchSantri.toLowerCase()) ||
      String(s.nisn).includes(searchSantri)
  );

  const paginatedSantri = filteredSantri.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isAdmin || isGuru ? "Pencatatan Mutaba'ah Harian" : "Capaian Mutaba'ah Santri"}
        </h1>
        <p className="text-sm text-slate-500">
          Pemantauan ibadah &amp; kedisiplinan harian, evaluasi kelayakan izin pulang (&gt;90%), dan rekap Wali Bina.
        </p>
      </div>

      {/* VIEW 1: SISWA */}
      {isSiswa && !isAdmin && !isGuru && userData?.siswa && (
        <RekapMutabaahView siswaId={userData.siswa.id} />
      )}

      {/* VIEW 2: ORANG TUA */}
      {isOrangTua && !isAdmin && !isGuru && (
        <div className="space-y-4">
          {userData?.orang_tua?.siswa?.length > 1 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mr-3 text-sm font-medium text-slate-700">Pilih Putra / Putri:</label>
              <select
                value={selectedAnakId || ""}
                onChange={(e) => setSelectedAnakId(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                {userData.orang_tua.siswa.map((anak: any) => (
                  <option key={anak.id} value={anak.id}>
                    {anak.nama_lengkap} (NISN: {anak.nisn})
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedAnakId ? (
            <RekapMutabaahView siswaId={selectedAnakId} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Belum ada data putra/putri yang ditautkan ke akun Anda.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: INPUT HARIAN (MUSYRIF & ADMIN) */}
      {(isAdmin || isGuru) && (
        <div className="space-y-6">
          {/* NOTIFIKASI HARI TERLEWAT PEKAN BERJALAN */}
          {ringkasanTerlewat.total_hari_terlewat > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Perhatian: Terdapat {ringkasanTerlewat.total_hari_terlewat} hari pada pekan ini yang belum lengkap diinput
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Klik tanggal di bawah ini untuk langsung berpindah dan melengkapi catatan mutaba&apos;ah santri:
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ringkasanTerlewat.detail_tanggal.map((item) => (
                  <button
                    key={item.tanggal}
                    type="button"
                    onClick={() => {
                      setTanggal(item.tanggal);
                      setSelectedSantri(null);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${tanggal === item.tanggal
                      ? "border-amber-700 bg-amber-600 text-white"
                      : "border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                      }`}
                  >
                    {item.tanggal} ({item.jumlah_santri} santri belum diisi)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GRID DAFTAR SANTRI & FORM CHECKLIST HARIAN */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Kolom Kiri: Daftar Santri Binaan */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-slate-800">Daftar Santri Binaan</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari nama / NISN..."
                    value={searchSantri}
                    onChange={(e) => {
                      setSearchSantri(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500">Tanggal:</label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => {
                        setTanggal(e.target.value);
                        setSelectedSantri(null);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Nama Santri</th>
                        <th className="px-4 py-3 font-semibold">Status ({tanggal})</th>
                        <th className="px-4 py-3 font-semibold">Skor Pekanan</th>
                        <th className="px-4 py-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredSantri.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            Belum ada santri binaan yang dipasangkan ke akun Anda.
                          </td>
                        </tr>
                      ) : (
                        paginatedSantri.map((s) => (
                          <tr
                            key={s.id}
                            className={`hover:bg-slate-50 ${selectedSantri?.id === s.id ? "bg-emerald-50/60" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800">{s.nama_lengkap}</p>
                              <p className="text-xs text-slate-400">Musyrif: {s.musyrif}</p>
                              {s.jumlah_hari_terlewat > 0 && (
                                <span className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                                  {s.jumlah_hari_terlewat} hari terlewat pekan ini
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {s.sudah_diisi ? (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                  Sudah Diisi ({s.data_harian.status_kehadiran.replace("_", " ")})
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                  Belum Diisi
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-semibold ${s.skor_pekanan.memenuhi_syarat_izin ? "text-emerald-600" : "text-red-600"
                                  }`}
                              >
                                {s.skor_pekanan.persentase}%
                              </span>
                            </td>
                            <td className="space-x-2 px-4 py-3">
                              <button
                                onClick={() => handleSelectSantriForInput(s)}
                                className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                              >
                                {s.sudah_diisi ? "Edit" : "Input"}
                              </button>
                              <Link
                                href={`/mutabaah/rekap/${s.id}`}
                                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                Rekap
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredSantri.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
              </div>
            </div>

            {/* Kolom Kanan: Form Checklist Harian */}
            <div className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {!selectedSantri ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Klik tombol <strong>Input</strong> atau <strong>Edit</strong> pada salah satu santri untuk mencatat mutaba&apos;ah tanggal <strong>{tanggal}</strong>.
                </div>
              ) : (
                <form onSubmit={handleSimpanHarian} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs text-slate-400">Input Tanggal {tanggal}</p>
                    <h3 className="text-lg font-bold text-slate-800">{selectedSantri.nama_lengkap}</h3>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Status Kehadiran Asrama</label>
                    <select
                      value={statusKehadiran}
                      onChange={(e) => setStatusKehadiran(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="hadir">Hadir di Asrama (Aktif Dinilai)</option>
                      <option value="izin_pulang">Izin Pulang (Tidak Mengurangi Skor)</option>
                      <option value="sakit">Sakit / Istirahat</option>
                    </select>
                  </div>

                  {statusKehadiran === "hadir" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">Checklist Indikator Kebiasaan</label>
                      {indikatorList.length === 0 ? (
                        <p className="text-xs text-red-500">Belum ada indikator aktif. Hubungi Admin.</p>
                      ) : (
                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                          {indikatorList.map((ind) => (
                            <label key={ind.id} className="flex cursor-pointer items-start gap-2.5 text-sm">
                              <input
                                type="checkbox"
                                checked={Boolean(checkedIndikator[ind.id])}
                                onChange={(e) =>
                                  setCheckedIndikator({ ...checkedIndikator, [ind.id]: e.target.checked })
                                }
                                className="mt-1 rounded border-slate-300 text-emerald-600"
                              />
                              <div>
                                <p className="font-medium text-slate-800">{ind.nama_indikator}</p>
                                <p className="text-[11px] text-slate-400">
                                  {ind.kategori} &bull; Bobot: {ind.bobot_nilai}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Catatan Musyrif (Opsional)</label>
                    <textarea
                      rows={2}
                      value={catatanHarian}
                      onChange={(e) => setCatatanHarian(e.target.value)}
                      placeholder="Contoh: Sangat disiplin, atau terlambat jamaah..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingHarian}
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isSavingHarian ? "Menyimpan..." : "Simpan Catatan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSantri(null)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}