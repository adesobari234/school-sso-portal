"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";
import KopSurat, { SchoolProfile } from "@/components/KopSurat";

export default function ProfilSekolahTab() {
  const { toast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<SchoolProfile>({
    nama_yayasan: "",
    nama_sekolah: "",
    alamat_sekolah: "",
    telepon_sekolah: "",
    email_sekolah: "",
    website_sekolah: "",
    logo_sekolah_url: null,
    logo_instansi_url: null,
  });

  const [logoSekolahFile, setLogoSekolahFile] = useState<File | null>(null);
  const [logoInstansiFile, setLogoInstansiFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/school-profile`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          setForm(await res.json());
        }
      } catch {
        toast.error("Gagal memuat profil sekolah.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "sekolah" | "instansi"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === "sekolah") {
      setLogoSekolahFile(file);
      setForm((prev) => ({ ...prev, logo_sekolah_url: previewUrl }));
    } else {
      setLogoInstansiFile(file);
      setForm((prev) => ({ ...prev, logo_instansi_url: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("nama_yayasan", form.nama_yayasan || "");
      formData.append("nama_sekolah", form.nama_sekolah || "");
      formData.append("alamat_sekolah", form.alamat_sekolah || "");
      formData.append("telepon_sekolah", form.telepon_sekolah || "");
      formData.append("email_sekolah", form.email_sekolah || "");
      formData.append("website_sekolah", form.website_sekolah || "");

      if (logoSekolahFile) formData.append("logo_sekolah", logoSekolahFile);
      if (logoInstansiFile) formData.append("logo_instansi", logoInstansiFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/school-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan profil sekolah.");

      setForm(data.data);
      setLogoSekolahFile(null);
      setLogoInstansiFile(null);
      toast.success(data.message || "Profil & KOP sekolah berhasil diperbarui.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Memuat profil sekolah...</div>;

  return (
    <div className="space-y-6">
      {/* Live Preview KOP */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pratinjau KOP Surat Resmi
        </p>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
          <KopSurat profile={form} />
        </div>
      </div>

      {/* Form Edit Profil */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-bold text-slate-800">Identitas & Logo Sekolah</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nama Yayasan / Naungan
            </label>
            <input
              type="text"
              placeholder="YAYASAN AL-AZIZ ISLAMIC BOARDING SCHOOL"
              value={form.nama_yayasan || ""}
              onChange={(e) => setForm({ ...form, nama_yayasan: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nama Sekolah *
            </label>
            <input
              type="text"
              required
              placeholder="SMA AL-AZIZ ISLAMIC BOARDING SCHOOL"
              value={form.nama_sekolah || ""}
              onChange={(e) => setForm({ ...form, nama_sekolah: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Alamat Lengkap</label>
          <textarea
            rows={2}
            placeholder="Jl. Kolonel Masturi Km. 3,8..."
            value={form.alamat_sekolah || ""}
            onChange={(e) => setForm({ ...form, alamat_sekolah: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Telepon / HP
            </label>
            <input
              type="text"
              placeholder="(022) 2700018 / HP. 0811..."
              value={form.telepon_sekolah || ""}
              onChange={(e) => setForm({ ...form, telepon_sekolah: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
            <input
              type="email"
              placeholder="alazizibs@gmail.com"
              value={form.email_sekolah || ""}
              onChange={(e) => setForm({ ...form, email_sekolah: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Website</label>
            <input
              type="text"
              placeholder="www.alaziz.sch.id"
              value={form.website_sekolah || ""}
              onChange={(e) => setForm({ ...form, website_sekolah: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Upload Logo Kiri & Kanan */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Logo Sekolah (Kiri & Halaman Login)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFileChange(e, "sekolah")}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">Format PNG transparan disarankan (Maks 2MB).</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Logo Instansi / Pemprov (Kanan - Opsional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFileChange(e, "instansi")}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="mt-1 text-[11px] text-slate-400">Kosongkan jika KOP hanya memakai 1 logo.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan Profil & KOP"}
          </button>
        </div>
      </form>
    </div>
  );
}