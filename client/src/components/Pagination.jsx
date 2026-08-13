import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — reusable page navigator for admin list pages.
 *
 * Props:
 *   page        — current page (1-indexed)
 *   totalPages  — total number of pages
 *   total       — total number of records
 *   limit       — records per page
 *   onPage      — callback(newPage: number)
 */
export default function Pagination({ page, totalPages, total, limit, onPage }) {
    if (!totalPages || totalPages <= 1) return null;

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    // Generate a sensible page window (at most 5 visible page buttons)
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, page - delta);
        const right = Math.min(totalPages, page + delta);

        if (left > 1) pages.push(1);
        if (left > 2) pages.push("...");

        for (let i = left; i <= right; i++) pages.push(i);

        if (right < totalPages - 1) pages.push("...");
        if (right < totalPages) pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#ecebf3]">
            <p className="text-xs text-[#a8a3bd]">
                Showing <span className="font-semibold text-[#6b6680]">{from}–{to}</span>{" "}
                of <span className="font-semibold text-[#6b6680]">{total.toLocaleString()}</span> records
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPage(page - 1)}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ecebf3] text-[#6b6680] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed] disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={15} />
                </button>

                {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="h-8 w-8 flex items-center justify-center text-xs text-[#a8a3bd]">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPage(p)}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                                p === page
                                    ? "bg-[#7c3aed] text-white shadow-sm"
                                    : "border border-[#ecebf3] text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                            }`}
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ecebf3] text-[#6b6680] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed] disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next page"
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
