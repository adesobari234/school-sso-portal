"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const verifyUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Unauthorized");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Memuat antarmuka...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar roles={user?.roles || []} />
      <div className="flex flex-1 flex-col">
        <Navbar user={user} />
        
        <main className="relative flex-1 p-6">
          {/* Skeleton Loading Layar Penuh (Menutupi Area Konten Saja) */}
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-50 p-6">
              <div className="animate-pulse space-y-6">
                {/* Skeleton untuk Header/Banner */}
                <div className="h-24 w-full rounded-xl bg-slate-200"></div>
                
                {/* Skeleton untuk Kartu-Kartu Data (Grid) */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-32 rounded-lg bg-slate-200"></div>
                  <div className="h-32 rounded-lg bg-slate-200"></div>
                </div>
                
                {/* Skeleton untuk Tabel (Opsional) */}
                <div className="h-48 w-full rounded-lg bg-slate-200 mt-6"></div>
              </div>
            </div>
          )}
          
          {/* Children tetap di-render untuk memuaskan Turbopack Next.js, tapi disembunyikan saat loading */}
          <div className={isLoading ? "invisible h-0 opacity-0 overflow-hidden" : "visible h-auto opacity-100 transition-opacity duration-500"}>
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}