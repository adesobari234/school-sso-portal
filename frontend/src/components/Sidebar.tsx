"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  roles: any[];
}

export default function Sidebar({ roles }: SidebarProps) {
  const pathname = usePathname();
  const roleNames = roles?.map((r) => r.nama_role) || [];

  const menuItems = [
    { name: "Beranda", path: "/dashboard", roles: ["Admin", "Guru", "Siswa", "Orang Tua"] },
    { name: "Data Guru", path: "/dashboard/guru", roles: ["Admin"] },
    { name: "Data Siswa", path: "/dashboard/siswa", roles: ["Admin"] },
    { name: "Data Orang Tua", path: "/dashboard/orangtua", roles: ["Admin"]},
    { name: "Pengaturan", path: "/dashboard/settings", roles: ["Admin"] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="p-5 text-xl font-bold border-b border-slate-800 tracking-wide text-blue-400">
        SSO PORTAL
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          // Cek apakah user memiliki hak akses untuk menu ini
          const hasAccess = item.roles.some((role) => roleNames.includes(role));
          if (!hasAccess) return null;

          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-2.5 rounded-md text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}