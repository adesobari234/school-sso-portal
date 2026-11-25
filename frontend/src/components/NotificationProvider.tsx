"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface NotificationContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string, title = "Berhasil") => addToast("success", message, title),
    error: (message: string, title = "Terjadi Kesalahan") => addToast("error", message, title),
    info: (message: string, title = "Informasi") => addToast("info", message, title),
  };

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || "Konfirmasi Tindakan",
        message: options.message,
        confirmText: options.confirmText || "Ya, Lanjutkan",
        cancelText: options.cancelText || "Batal",
        variant: options.variant || "danger",
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* CONTAINER TOAST (Pojok Kanan Atas) */}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((item) => {
          const styles = {
            success: "border-emerald-200 bg-white text-slate-800",
            error: "border-red-200 bg-white text-slate-800",
            info: "border-blue-200 bg-white text-slate-800",
          }[item.type];

          const badgeStyles = {
            success: "bg-emerald-100 text-emerald-600",
            error: "bg-red-100 text-red-600",
            info: "bg-blue-100 text-blue-600",
          }[item.type];

          const icon = {
            success: "✓",
            error: "!",
            info: "i",
          }[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${styles}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeStyles}`}
              >
                {icon}
              </span>
              <div className="flex-1 text-sm">
                {item.title && <p className="font-semibold text-slate-800">{item.title}</p>}
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL KONFIRMASI */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    confirmState.variant === "danger"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {confirmState.variant === "danger" ? "!" : "?"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{confirmState.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {confirmState.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                  confirmState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification harus digunakan di dalam NotificationProvider");
  }
  return context;
}