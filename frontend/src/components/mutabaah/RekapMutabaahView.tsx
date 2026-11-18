"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";

interface RekapProps {
  siswaId: number | string;
}

export default function RekapMutabaahView({ siswaId }: RekapProps) {
  const now = new Date();
  const [periode, setPeriode] = useState<"pekanan" | "bulanan" | "semester">("pekanan");
  const [bulan, setBulan] = useState<number>(now.getMonth() + 1);
  const [tahun, setTahun] = useState<number>(now.getFullYear());
  const [semester, setSemester] = useState<"ganjil" | "genap">(now.getMonth() + 1 <= 6 ? "genap" : "ganjil");

  const [rekap, setRekap] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siswaId) return;

    const fetchRekap = async () => {
      setCurrentPage(1);
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const query = new URLSearchParams({
          periode,
          bulan: String(bulan),
          tahun: String(tahun),
          semester,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/mutabaah/rekap/${siswaId}?${query.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Gagal memuat rekap mutaba'ah");
        }

        const data = await res.json();
        setRekap(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRekap();
  }, [siswaId, periode, bulan, tahun, semester]);

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      {/* Filter Periode */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          {(["pekanan", "bulanan", "semester"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setPeriode(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${periode === item
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Filter Tambahan untuk Bulanan / Semester */}
        <div className="flex flex-wrap items-center gap-2">
          {periode === "bulanan" && (
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              {namaBulan.map((nama, idx) => (
                <option key={idx + 1} value={idx + 1}>{nama}</option>
              ))}
            </select>
          )}

          {periode === "semester" && (
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as "ganjil" | "genap")}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="ganjil">Semester Ganjil (Jul - Des)</option>
              <option value="genap">Semester Genap (Jan - Jun)</option>
            </select>
          )}

          {(periode === "bulanan" || periode === "semester") && (
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          )}
        </div>
      </div>

      {isLoading && <div className="p-4 text-sm text-slate-500">Menghitung capaian mutaba&apos;ah...</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {!isLoading && !error && rekap && (
        <>
          {/* Ringkasan Skor & Syarat Izin */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Periode: {rekap.evaluasi.periode.mulai} s/d {rekap.evaluasi.periode.selesai}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {rekap.evaluasi.skor.persentase}%
                </span>
                <span className="text-xs text-slate-500">
                  ({rekap.evaluasi.skor.poin_diperoleh} / {rekap.evaluasi.skor.poin_maksimal} poin)
                </span>
              </div>
              <div className="mt-3">
                {rekap.evaluasi.skor.memenuhi_syarat_izin ? (
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Memenuhi Syarat Izin Pulang (&gt; 90%)
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Belum Memenuhi Syarat Izin (&le; 90%)
                  </span>
                )}
              </div>
            </div>

            {/* Kehadiran Asrama */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Status Kehadiran Asrama</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-lg font-bold text-slate-800">{rekap.evaluasi.kehadiran.hadir}</p>
                  <p className="text-[11px] text-slate-500">Hari Aktif</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2">
                  <p className="text-lg font-bold text-blue-700">{rekap.evaluasi.kehadiran.izin_pulang}</p>
                  <p className="text-[11px] text-blue-600">Izin Pulang</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <p className="text-lg font-bold text-amber-700">{rekap.evaluasi.kehadiran.sakit}</p>
                  <p className="text-[11px] text-amber-600">Sakit</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                *Hari izin pulang & sakit tidak mengurangi pembagi skor.
              </p>
            </div>

            {/* Rincian Per Kategori (Bahan Rapor Wali Bina) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Capaian per Aspek (Wali Bina)</p>
              <div className="mt-2 space-y-1.5 text-xs">
                {Object.entries(rekap.evaluasi.per_kategori).map(([kategori, val]: [string, any]) => (
                  <div key={kategori} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{kategori}</span>
                    <span className="font-semibold text-slate-800">
                      {val.persentase}% <span className="font-normal text-slate-400">({val.earned}/{val.max})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Riwayat Harian */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold text-slate-800">Riwayat Pencatatan Harian</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tanggal</th>
                    <th className="px-6 py-3 font-semibold">Status Asrama</th>
                    <th className="px-6 py-3 font-semibold">Indikator Tercapai</th>
                    <th className="px-6 py-3 font-semibold">Catatan Musyrif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rekap.riwayat.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-slate-500">
                        Belum ada data mutaba&apos;ah pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    rekap.riwayat
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item: any) => {
                        const tercapai = item.details?.filter((d: any) => d.is_tercapai).length || 0;
                        const total = item.details?.length || 0;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-800">{item.tanggal}</td>
                            <td className="px-6 py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${item.status_kehadiran === "hadir"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : item.status_kehadiran === "izin_pulang"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-amber-50 text-amber-700"
                                  }`}
                              >
                                {item.status_kehadiran.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              {item.status_kehadiran === "hadir" ? `${tercapai} / ${total} indikator` : "-"}
                            </td>
                            <td className="px-6 py-3 text-slate-500">{item.catatan || "-"}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={rekap.riwayat.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </>
      )}
    </div>
  );
}