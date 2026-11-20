"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PengaturanMutabaahPage() {
  const [minSkorIzin, setMinSkorIzin] = useState("90");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 403) {
          setIsForbidden(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setMinSkorIzin(String(data.min_skor_izin ?? "90"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mutabaah/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ min_skor_izin: Number(minSkorIzin) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan pengaturan");

      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Memuat pengaturan Mutaba&apos;ah...</div>;
  }

  if (isForbidden) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-bold">Akses Ditolak</p>
        <p className="mt-1">Halaman pengaturan Mutaba&apos;ah hanya dapat diakses oleh Admin.</p>
        <Link href="/mutabaah" className="mt-4 inline-block font-semibold underline">
          &larr; Kembali ke Mutaba&apos;ah
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem Mutaba&apos;ah</h1>
        <p className="text-sm text-slate-500">
          Atur parameter penilaian dan syarat kelayakan izin pulang santri.
        </p>
      </div>

      <form
        onSubmit={handleSimpan}
        className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Ambang Batas Minimal Skor Izin Pulang (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              required
              value={minSkorIzin}
              onChange={(e) => setMinSkorIzin(e.target.value)}
              className="w-32 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-800"
            />
            <span className="text-sm font-medium text-slate-500">%</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Santri wajib memperoleh skor pekanan di atas batas ini (default <strong>90%</strong>) agar memenuhi syarat pengajuan izin pulang akhir pekan.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}