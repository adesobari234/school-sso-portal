"use client";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Membuat daftar nomor halaman yang ringkas (misal: 1 ... 4 5 6 ... 12)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-600">
      {/* Info Jumlah Data & Pilihan Baris */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="text-slate-800">{startItem}</strong>–
          <strong className="text-slate-800">{endItem}</strong> dari{" "}
          <strong className="text-slate-800">{totalItems}</strong> data
        </span>

        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
          >
            <option value={10}>10 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        )}
      </div>

      {/* Tombol Navigasi Halaman */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &larr; Prev
          </button>

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(Number(page))}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${
                  currentPage === page
                    ? "bg-slate-800 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}