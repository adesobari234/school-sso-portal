"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

export default function RaporMutabaahPage() {
  const params = useParams();
  const router = useRouter();
  const siswaId = params.siswaId;
  const { toast } = useNotification();

  const [bulan, setBulan] = useState("");
  const [rapor, setRapor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRapor = async (selectedBulan = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = selectedBulan ? `?bulan=${selectedBulan}` : "";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mutabaah/rapor/${siswaId}${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat data rapor.");

      setRapor(data);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memuat rapor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (siswaId) fetchRapor(bulan);
  }, [siswaId, bulan]);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Menyiapkan lembar rapor santri...</div>;
  }

  if (!rapor) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Data rapor tidak tersedia.{" "}
        <button onClick={() => router.back()} className="font-semibold text-blue-600 underline">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar Kontrol (Disembunyikan saat dicetak) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            &larr; Kembali
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Filter Bulan:</label>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />
            {bulan && (
              <button
                type="button"
                onClick={() => setBulan("")}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Reset (1 Semester)
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Lembar Kertas Rapor A4 */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none">
        {/* Kop Surat */}
        <div className="border-b-2 border-slate-800 pb-4 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            {rapor.sekolah.nama_sekolah}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            LAPORAN EVALUASI MUTABA&apos;AH YAUMIYAH SANTRI
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Tahun Ajaran {rapor.periode.tahun_ajaran} &bull; Semester {rapor.periode.semester} (
            {rapor.periode.filter_bulan})
          </p>
        </div>

        {/* Identitas Santri */}
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm sm:grid-cols-2 print:bg-transparent">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 text-slate-500">Nama Santri</span>
              <span className="font-semibold text-slate-800">: {rapor.siswa.nama_lengkap}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500">NISN</span>
              <span className="font-medium text-slate-800">: {rapor.siswa.nisn || "-"}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 text-slate-500">Kelas</span>
              <span className="font-medium text-slate-800">: {rapor.siswa.kelas}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500">Musyrif Pembina</span>
              <span className="font-medium text-slate-800">: {rapor.siswa.nama_musyrif}</span>
            </div>
          </div>
        </div>

        {/* Tabel Capaian per Kategori */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-800">
            A. Capaian Aspek Pembinaan
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 px-4 py-2.5 text-center w-12">No</th>
                <th className="border border-slate-300 px-4 py-2.5">Aspek / Kategori</th>
                <th className="border border-slate-300 px-4 py-2.5 text-center">Poin Capaian</th>
                <th className="border border-slate-300 px-4 py-2.5 text-center">Nilai (%)</th>
                <th className="border border-slate-300 px-4 py-2.5">Predikat</th>
              </tr>
            </thead>
            <tbody>
              {rapor.rincian_kategori.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-slate-300 px-4 py-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 px-4 py-2 font-medium text-slate-800">
                    {item.kategori}
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-slate-600">
                    {item.poin_tercapai} / {item.poin_maksimal}
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-center font-semibold text-slate-800">
                    {item.nilai_akhir}%
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    {item.predikat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan & Predikat Akhir */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-800">
            B. Ringkasan Evaluasi
          </h2>
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-300 p-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Total Hari Tercatat</p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {rapor.ringkasan.total_hari_terisi} Hari
              </p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-xs text-slate-500">Rata-Rata Skor Harian</p>
              <p className="mt-1 text-lg font-bold text-blue-700 print:text-slate-900">
                {rapor.ringkasan.rata_rata_skor}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Predikat Keseluruhan</p>
              <p className="mt-1 text-sm font-bold text-emerald-700 print:text-slate-900">
                {rapor.ringkasan.predikat_akhir}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Orang Tua / Wali Santri</p>
            <div className="h-20"></div>
            <p className="font-semibold underline">( ........................................ )</p>
          </div>
          <div>
            <p>Menyetujui,</p>
            <p className="font-semibold">Kepala Asrama / Sekolah</p>
            <div className="h-20"></div>
            <p className="font-semibold underline">( ........................................ )</p>
          </div>
          <div>
            <p>Musyrif Pembina,</p>
            <p className="font-semibold">&nbsp;</p>
            <div className="h-20"></div>
            <p className="font-semibold underline">{rapor.siswa.nama_musyrif}</p>
          </div>
        </div>
      </div>
    </div>
  );
}