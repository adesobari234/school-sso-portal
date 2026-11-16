"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function KelolaRelasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [siswa, setSiswa] = useState<any>(null);
  const [semuaOrangTua, setSemuaOrangTua] = useState<any[]>([]);
  const [relasi, setRelasi] = useState<{ orang_tua_id: number; status_hubungan: string }[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

        // 1. Ambil data Siswa beserta relasinya saat ini
        const resSiswa = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, { headers });
        if (!resSiswa.ok) throw new Error("Gagal mengambil data siswa");
        const dataSiswa = await resSiswa.json();
        setSiswa(dataSiswa);
        
        // Format relasi lama untuk state
        if (dataSiswa.orang_tua) {
          const relasiLama = dataSiswa.orang_tua.map((ot: any) => ({
            orang_tua_id: ot.id,
            status_hubungan: ot.pivot.status_hubungan
          }));
          setRelasi(relasiLama);
        }

        // 2. Ambil semua data Orang Tua untuk pilihan dropdown
        const resOrangTua = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orangtua`, { headers });
        if (resOrangTua.ok) {
          const dataOrangTua = await resOrangTua.json();
          setSemuaOrangTua(dataOrangTua);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fungsi untuk menambah baris relasi baru di form
  const tambahBarisRelasi = () => {
    setRelasi([...relasi, { orang_tua_id: 0, status_hubungan: "Ayah" }]);
  };

  // Fungsi untuk menghapus baris relasi di form
  const hapusBarisRelasi = (index: number) => {
    const newRelasi = [...relasi];
    newRelasi.splice(index, 1);
    setRelasi(newRelasi);
  };

  // Fungsi untuk mengupdate data di baris tertentu
  const updateRelasi = (index: number, field: string, value: string | number) => {
    const newRelasi = [...relasi];
    newRelasi[index] = { ...newRelasi[index], [field]: value };
    setRelasi(newRelasi);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // Filter relasi yang orang_tua_id nya valid (tidak 0)
      const validRelasi = relasi.filter(r => r.orang_tua_id !== 0);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}/sync-orangtua`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({ relasi: validRelasi }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal menyimpan relasi");
      }

      alert("Relasi berhasil disimpan!");
      router.push("/dashboard/siswa");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Relasi Orang Tua</h1>
        <Link href="/dashboard/siswa" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Kembali
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Data Siswa</h2>
          <p className="text-slate-600">Nama: {siswa?.nama_lengkap} (NISN: {siswa?.nisn})</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Daftar Orang Tua / Wali</label>
            
            {relasi.length === 0 && (
              <p className="text-sm text-slate-500 italic">Belum ada orang tua yang dihubungkan.</p>
            )}

            {relasi.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <select 
                    value={item.orang_tua_id} 
                    onChange={(e) => updateRelasi(index, 'orang_tua_id', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value={0} disabled>Pilih Orang Tua...</option>
                    {semuaOrangTua.map(ot => (
                      <option key={ot.id} value={ot.id}>{ot.nama_lengkap} (NIK: {ot.nik})</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <select 
                    value={item.status_hubungan} 
                    onChange={(e) => updateRelasi(index, 'status_hubungan', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali</option>
                  </select>
                </div>
                <button type="button" onClick={() => hapusBarisRelasi(index)} className="text-red-500 hover:text-red-700 px-2 text-xl font-bold">
                  &times;
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={tambahBarisRelasi} className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 block">
            + Tambah Orang Tua / Wali
          </button>

          <div className="pt-6 border-t border-slate-100">
            <button type="submit" disabled={isSaving}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70">
              {isSaving ? "Menyimpan..." : "Simpan Relasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}