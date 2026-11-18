"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutSSO } from "@/utils/auth";

export default function MutabaahSidebar() {
  const pathname = usePathname();
  const [roles, setRoles] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data?.user?.roles || []);
      }
    };
    fetchRoles();
  }, []);

  const isAdmin = roles.includes("Admin");
  const isGuru = roles.includes("Guru");

  const menus = [
    {
      name: isAdmin || isGuru ? "Pencatatan Harian" : "Capaian Mutaba'ah",
      path: "/mutabaah",
      show: true,
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: "Master Indikator",
      path: "/mutabaah/indikator",
      show: isAdmin,
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      name: "Plotting Musyrif",
      path: "/mutabaah/plotting",
      show: isAdmin,
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Tombol Buka Menu di Layar Mobile */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-xs font-semibold text-white shadow-lg md:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menu
      </button>

      {/* Backdrop Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen flex-col border-r border-emerald-900 bg-emerald-950 text-white transition-all duration-300 md:static ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header Sidebar & Tombol Minimize */}
        <div className="flex items-center justify-between border-b border-emerald-900 p-4">
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Aplikasi Boarding
              </span>
              <h2 className="truncate text-base font-bold text-white">Sistem Mutaba&apos;ah</h2>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
            className="hidden rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-900 hover:text-white md:block mx-auto"
          >
            {isCollapsed ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>

          {/* Tombol Tutup di Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-900 md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Daftar Menu */}
        <nav className="flex-1 space-y-1.5 p-3">
          {menus
            .filter((m) => m.show)
            .map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-100 hover:bg-emerald-900/70"
                  }`}
                >
                  {item.icon}
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer: Kembali ke Portal SSO & Logout */}
        <div className="space-y-2 border-t border-emerald-900 p-3">
          <Link
            href="/dashboard"
            title={isCollapsed ? "Kembali ke Portal SSO" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg border border-emerald-700 bg-emerald-900/50 px-3 py-2.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-800 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {!isCollapsed && <span className="truncate">Portal Utama SSO</span>}
          </Link>

          <button
            type="button"
            onClick={logoutSSO}
            title={isCollapsed ? "Keluar dari Akun" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg bg-red-600/20 px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-600 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="truncate">Keluar (Logout)</span>}
          </button>
        </div>
      </aside>
    </>
  );
}