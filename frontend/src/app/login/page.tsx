"use client";

import { useEffect, useState } from "react";
import { SchoolProfile } from "@/components/KopSurat";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/school-profile`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSchoolProfile(data);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan login.");
      }

      localStorage.setItem("token", data.access_token);
      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/dashboard";
      window.location.href = redirectTarget;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* PANEL KIRI: BRANDING SEKOLAH */}
        <section className="relative isolate flex min-h-[360px] flex-col overflow-hidden bg-[#123b32] px-7 py-8 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-16 lg:py-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_15%,rgba(196,162,94,0.2),transparent_35%),linear-gradient(145deg,#123b32_0%,#0d3029_60%,#09251f_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 top-32 -z-10 h-72 w-72 rounded-full border border-white/10"
          />

          {/* Header Logo & Identitas Sekolah */}
          <div className="flex items-center gap-4">
            {schoolProfile?.logo_sekolah_url ? (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-lg shadow-black/20 ring-1 ring-[#e8d6a9]/40 sm:h-16 sm:w-16">
                <img
                  src={schoolProfile.logo_sekolah_url}
                  alt={schoolProfile.nama_sekolah || "Logo Sekolah"}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="h-9 w-9"
                >
                  <path
                    d="M8 21.5 24 11l16 10.5v17H8v-17Z"
                    stroke="#E8D6A9"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 38.5V27h14v11.5M21 27v-5h6v5M24 7v4M21.5 7h5"
                    stroke="#E8D6A9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 32h2m14 0h2"
                    stroke="#E8D6A9"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e8d6a9] sm:text-sm">
                {schoolProfile?.nama_sekolah || "PORTAL TERPADU"}
              </p>
              <p className="mt-1 truncate text-xs text-white/70">
                {schoolProfile?.nama_yayasan || "Islamic Boarding School"}
              </p>
            </div>
          </div>

          <div className="my-auto max-w-xl py-12 lg:py-20">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8d6a9]/30 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#f0dfb6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e8d6a9]" />
              PORTAL AKADEMIK &amp; KESANTRIAN
            </p>
            <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Tumbuh dalam ilmu,{" "}
              <span className="font-serif italic text-[#e8d6a9]">
                berakhlak
              </span>{" "}
              dalam kehidupan.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              Satu akses untuk mendukung kegiatan akademik, pembinaan, dan
              komunikasi keluarga di lingkungan sekolah berasrama.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Akademik</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Informasi dan layanan sekolah
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Kesantrian</p>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  Pemantauan kegiatan dan pembinaan
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/45">
            Membangun generasi berilmu, mandiri, dan berakhlak mulia.
          </p>
        </section>

        {/* PANEL KANAN: FORM LOGIN */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            {/* Header Ringkas Tampilan Mobile */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              {schoolProfile?.logo_sekolah_url && (
                <img
                  src={schoolProfile.logo_sekolah_url}
                  alt="Logo Sekolah"
                  className="h-10 w-10 shrink-0 object-contain"
                />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
                  {schoolProfile?.nama_sekolah || "PORTAL TERPADU"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {schoolProfile?.nama_yayasan || "Islamic Boarding School"}
                </p>
              </div>
            </div>

            <div className="mb-9">
              <p className="mb-3 text-sm font-medium text-emerald-800">
                Assalamu&apos;alaikum
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Selamat datang
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masuk untuk melanjutkan ke portal akademik dan kesantrian.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  placeholder="Masukkan password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-[#123b32] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d3029] focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Memproses..." : "Masuk ke Portal"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Gunakan akun yang telah diberikan oleh administrator sekolah.
            </p>
            <p className="mt-12 text-center text-xs text-slate-400">
              © {new Date().getFullYear()}{" "}
              {schoolProfile?.nama_sekolah || "Portal SSO Sekolah Boarding"}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}