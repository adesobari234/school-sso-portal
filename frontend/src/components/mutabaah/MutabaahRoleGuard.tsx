"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function MutabaahRoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const verifyModuleAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        const roles: string[] = data?.user?.roles || [];
        const isAdmin = roles.includes("Admin");
        const isGuru = roles.includes("Guru");
        const isSiswa = roles.includes("Siswa");
        const isOrangTua = roles.includes("Orang Tua");
        const isMusyrif = Boolean(data?.is_musyrif);

        // 1. Cek hak akses masuk aplikasi Mutaba'ah secara umum
        const canAccessApp = isAdmin || isSiswa || isOrangTua || (isGuru && isMusyrif);
        if (!canAccessApp) {
          router.replace("/dashboard");
          return;
        }

        // 2. Cek rute khusus Admin di dalam Mutaba'ah
        const adminOnlyPaths = [
          "/mutabaah/indikator",
          "/mutabaah/plotting",
          "/mutabaah/pengaturan",
        ];
        if (!isAdmin && adminOnlyPaths.some((p) => pathname.startsWith(p))) {
          router.replace("/mutabaah");
          return;
        }

        setIsAllowed(true);
      } catch (err) {
        console.error(err);
      }
    };

    verifyModuleAccess();
  }, [pathname, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memeriksa hak akses Sistem Mutaba&apos;ah...
      </div>
    );
  }

  return <>{children}</>;
}