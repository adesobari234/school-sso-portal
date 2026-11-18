"use client";

import AuthGuard from "@/components/AuthGuard";
import MutabaahSidebar from "@/components/mutabaah/MutabaahSidebar";

export default function MutabaahLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <MutabaahSidebar />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}