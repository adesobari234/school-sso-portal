"use client";

export interface SchoolProfile {
  nama_yayasan?: string;
  nama_sekolah: string;
  alamat_sekolah?: string;
  telepon_sekolah?: string;
  email_sekolah?: string;
  website_sekolah?: string;
  logo_sekolah_url?: string | null;
  logo_instansi_url?: string | null;
}

export default function KopSurat({ profile }: { profile: SchoolProfile }) {
  const kontakParts = [
    profile.telepon_sekolah ? `Telp. ${profile.telepon_sekolah}` : "",
    profile.email_sekolah ? `Email: ${profile.email_sekolah}` : "",
    profile.website_sekolah ? `Website: ${profile.website_sekolah}` : "",
  ].filter(Boolean);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 pb-3">
        {/* Logo Kiri (Sekolah) */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center">
          {profile.logo_sekolah_url && (
            <img
              src={profile.logo_sekolah_url}
              alt="Logo Sekolah"
              className="max-h-20 max-w-20 object-contain"
            />
          )}
        </div>

        {/* Teks Tengah */}
        <div className="flex-1 text-center leading-tight">
          {profile.nama_yayasan && (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-800 sm:text-sm">
              {profile.nama_yayasan}
            </p>
          )}
          <h1 className="mt-0.5 text-base font-extrabold uppercase tracking-wide text-slate-900 sm:text-xl">
            {profile.nama_sekolah}
          </h1>
          {profile.alamat_sekolah && (
            <p className="mt-1 text-[11px] text-slate-700">{profile.alamat_sekolah}</p>
          )}
          {kontakParts.length > 0 && (
            <p className="mt-0.5 text-[11px] text-slate-700">{kontakParts.join("  ")}</p>
          )}
        </div>

        {/* Logo Kanan (Instansi / Pemprov - Opsional) */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center">
          {profile.logo_instansi_url && (
            <img
              src={profile.logo_instansi_url}
              alt="Logo Instansi"
              className="max-h-20 max-w-20 object-contain"
            />
          )}
        </div>
      </div>

      {/* Garis Ganda Tebal-Tipis khas KOP Surat Resmi */}
      <div className="border-b-[3px] border-slate-900"></div>
      <div className="mt-[2px] border-b border-slate-900"></div>
    </div>
  );
}