"use client";

import AuthGuard from "@/components/AuthGuard";
import MutabaahRoleGuard from "@/components/mutabaah/MutabaahRoleGuard";
import MutabaahSidebar from "@/components/mutabaah/MutabaahSidebar";

export default function MutabaahLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MutabaahRoleGuard>
        <div className="flex min-h-screen bg-slate-50 print:bg-white">
          <div className="print:hidden">
            <MutabaahSidebar />
          </div>
          <main className="flex-1 p-6 md:p-8 print:p-0">{children}</main>
        </div>
      </MutabaahRoleGuard>
    </AuthGuard>
  );
}