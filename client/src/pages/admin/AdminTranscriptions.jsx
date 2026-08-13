import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { getAdminTranscriptions } from "../../services/adminApi.js";
import Pagination from "../../components/Pagination.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(s) {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatBytes(b) {
    if (!b) return "—";
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_OPTIONS = ["", "completed", "failed", "processing", "uploaded", "queued"];

const STATUS_MAP = {
    uploaded:   { label: "Uploaded",   cls: "bg-blue-50 text-blue-500" },
    queued:     { label: "Queued",     cls: "bg-amber-50 text-amber-500" },
    processing: { label: "Processing", cls: "bg-[#f5f3ff] text-[#7c3aed]" },
    completed:  { label: "Completed",  cls: "bg-emerald-50 text-emerald-600" },
    failed:     { label: "Failed",     cls: "bg-red-50 text-red-500" },
};

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="border-t border-[#ecebf3] animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <td key={i} className="py-4 px-3">
                    <div className="h-3.5 w-3/4 rounded-md bg-[#f1f0f5]" />
                </td>
            ))}
        </tr>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminTranscriptions() {
    const [searchParams] = useSearchParams();
    const initialUserId = searchParams.get("userId") || "";

    const [transcriptions, setTranscriptions] = useState([]);
    const [pagination, setPagination]         = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
    const [status, setStatus]                 = useState("");
    const [page, setPage]                     = useState(1);
    const [loading, setLoading]               = useState(true);
    const [userId]                            = useState(initialUserId);

    const fetchTranscriptions = useCallback(() => {
        setLoading(true);
        getAdminTranscriptions({ page, limit: 20, status, userId })
            .then((res) => {
                if (res.data.success) {
                    setTranscriptions(res.data.data);
                    setPagination(res.data.pagination);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, status, userId]);

    useEffect(() => { fetchTranscriptions(); }, [fetchTranscriptions]);

    return (
        <div className="flex flex-col gap-5">
            {/* Filters */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white p-4 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] flex flex-wrap items-center gap-3">
                <Filter size={15} className="text-[#a8a3bd] shrink-0" />
                <span className="text-xs font-semibold text-[#6b6680]">Filter by status:</span>
                <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1); }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${
                                status === s
                                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                                    : "border-[#ecebf3] text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                            }`}
                        >
                            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] overflow-hidden">
                <div className="p-5 pb-0">
                    <h2 className="text-sm font-bold text-[#0f0b1f]">
                        All Transcriptions
                        {!loading && (
                            <span className="ml-2 text-xs font-normal text-[#a8a3bd]">
                                ({pagination.total.toLocaleString()} total)
                            </span>
                        )}
                    </h2>
                    {userId && (
                        <p className="text-xs text-[#7c3aed] mt-0.5">Filtered by user ID: {userId}</p>
                    )}
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-[#a8a3bd] border-b border-[#ecebf3]">
                                <th className="pb-3 pt-1 px-5 font-semibold">File</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">User</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Status</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Duration</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Size</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : transcriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center text-sm text-[#a8a3bd]">
                                        No transcriptions found.
                                    </td>
                                </tr>
                            ) : (
                                transcriptions.map((t) => {
                                    const st = STATUS_MAP[t.status] ?? { label: t.status, cls: "bg-[#f1f0f5] text-[#6b6680]" };
                                    const user = t.userId;
                                    const userName = user
                                        ? `${user.firstName} ${user.lastName}`
                                        : "Unknown";
                                    return (
                                        <tr key={t._id} className="border-t border-[#ecebf3] hover:bg-[#faf9ff] transition-colors">
                                            <td className="py-3.5 px-5 max-w-[200px] truncate font-medium text-[#0f0b1f]" title={t.originalFileName}>
                                                {t.originalFileName}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div>
                                                    <p className="text-xs font-medium text-[#0f0b1f] truncate max-w-[130px]">{userName}</p>
                                                    {user?.email && (
                                                        <p className="text-[11px] text-[#a8a3bd] truncate max-w-[130px]">{user.email}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatDuration(t.duration)}</td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatBytes(t.fileSize)}</td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatDate(t.createdAt)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.totalPages > 1 && (
                    <div className="px-5 pb-5 mt-2">
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            total={pagination.total}
                            limit={pagination.limit}
                            onPage={(p) => setPage(p)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
