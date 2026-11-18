"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function AuthGuardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        const currentUrl = window.location.pathname + window.location.search;
        window.location.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          const currentUrl = window.location.pathname + window.location.search;
          window.location.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          return;
        }

        setIsAuthorized(true);
      } catch {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memverifikasi sesi SSO...
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Memverifikasi sesi SSO...
        </div>
      }
    >
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}