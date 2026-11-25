"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import RekapMutabaahView from "@/components/mutabaah/RekapMutabaahView";

export default function DetailRekapSiswaPage() {
  const params = useParams();
  const siswaId = params.siswaId as string;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Rekap Mutaba&apos;ah Santri</h1>
          <p className="text-sm text-slate-500">Evaluasi pekanan, bulanan, dan rapor Wali Bina</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/mutabaah"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            &larr; Kembali ke Mutaba&apos;ah
          </Link>
          <Link
            href={`/mutabaah/rapor/${siswaId}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
          >
            Cetak Rapor / PDF
          </Link>
        </div>
      </div>

      <RekapMutabaahView siswaId={siswaId} />
    </div>
  );
}