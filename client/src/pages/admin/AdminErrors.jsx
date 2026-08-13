import { useEffect, useState, useCallback } from "react";
import { getAdminErrors } from "../../services/adminApi.js";
import Pagination from "../../components/Pagination.jsx";
import { AlertTriangle, AlertCircle, Info, Filter } from "lucide-react";

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
    critical: { icon: AlertTriangle, bg: "#FEF2F2", color: "#dc2626", border: "#fecaca", label: "Critical" },
    high:     { icon: AlertTriangle, bg: "#FFF7ED", color: "#ea580c", border: "#fed7aa", label: "High" },
    medium:   { icon: AlertCircle,   bg: "#FFFBEB", color: "#d97706", border: "#fde68a", label: "Medium" },
    low:      { icon: Info,          bg: "#EFF6FF", color: "#2563eb", border: "#bfdbfe", label: "Low" },
    info:     { icon: Info,          bg: "#F1F0F5", color: "#6b6680", border: "#ecebf3", label: "Info" },
};

const DEFAULT_SEVERITY = { icon: AlertCircle, bg: "#F1F0F5", color: "#6b6680", border: "#ecebf3", label: "Unknown" };

const SEVERITY_OPTIONS = ["", "critical", "high", "medium", "low", "info"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="border-t border-[#ecebf3] animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
                <td key={i} className="py-4 px-3">
                    <div className="h-3.5 w-3/4 rounded-md bg-[#f1f0f5]" />
                </td>
            ))}
        </tr>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminErrors() {
    const [errors, setErrors]         = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
    const [severity, setSeverity]     = useState("");
    const [page, setPage]             = useState(1);
    const [loading, setLoading]       = useState(true);
    const [expanded, setExpanded]     = useState(null);

    const fetchErrors = useCallback(() => {
        setLoading(true);
        getAdminErrors({ page, limit: 20 })
            .then((res) => {
                if (res.data.success) {
                    setErrors(res.data.data);
                    setPagination(res.data.pagination);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, severity]);

    useEffect(() => { fetchErrors(); }, [fetchErrors]);

    // Client-side severity filter (no dedicated backend param yet)
    const displayed = severity
        ? errors.filter((e) => (e.severity || "").toLowerCase() === severity)
        : errors;

    return (
        <div className="flex flex-col gap-5">
            {/* Severity filter */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white p-4 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] flex flex-wrap items-center gap-3">
                <Filter size={15} className="text-[#a8a3bd] shrink-0" />
                <span className="text-xs font-semibold text-[#6b6680]">Severity:</span>
                <div className="flex flex-wrap gap-1.5">
                    {SEVERITY_OPTIONS.map((s) => {
                        const cfg = SEVERITY_CONFIG[s];
                        return (
                            <button
                                key={s}
                                onClick={() => { setSeverity(s); setPage(1); }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${
                                    severity === s
                                        ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                                        : "border-[#ecebf3] text-[#6b6680] hover:bg-[#f5f3ff]"
                                }`}
                            >
                                {s === "" ? "All" : (cfg?.label || s)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] overflow-hidden">
                <div className="p-5 pb-0">
                    <h2 className="text-sm font-bold text-[#0f0b1f]">
                        Error Log
                        {!loading && (
                            <span className="ml-2 text-xs font-normal text-[#a8a3bd]">
                                ({pagination.total.toLocaleString()} total)
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-[#a8a3bd] mt-0.5 mb-4">Application errors captured across CaptionFlow. Stack traces are not exposed here.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[660px] text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-[#a8a3bd] border-b border-[#ecebf3]">
                                <th className="pb-3 pt-1 px-5 font-semibold">Error</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Severity</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">User</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Type</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : displayed.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-14 text-center text-sm text-[#a8a3bd]">
                                        {errors.length === 0 ? "No errors recorded. 🎉" : "No errors match this filter."}
                                    </td>
                                </tr>
                            ) : (
                                displayed.map((err) => {
                                    const sev = err.severity?.toLowerCase();
                                    const cfg = SEVERITY_CONFIG[sev] || DEFAULT_SEVERITY;
                                    const Icon = cfg.icon;
                                    const user = err.userId;
                                    const userName = user ? `${user.firstName} ${user.lastName}` : "—";
                                    const isExpanded = expanded === err._id;

                                    return (
                                        <>
                                            <tr
                                                key={err._id}
                                                className="border-t border-[#ecebf3] hover:bg-[#faf9ff] transition-colors cursor-pointer"
                                                onClick={() => setExpanded(isExpanded ? null : err._id)}
                                            >
                                                {/* Error message */}
                                                <td className="py-3.5 px-5 max-w-[260px]">
                                                    <div className="flex items-start gap-2">
                                                        <div
                                                            className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                            style={{ backgroundColor: cfg.bg }}
                                                        >
                                                            <Icon size={13} style={{ color: cfg.color }} />
                                                        </div>
                                                        <p className={`text-xs font-medium text-[#0f0b1f] ${isExpanded ? "" : "truncate max-w-[200px]"}`}>
                                                            {err.message || "No message"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Severity */}
                                                <td className="py-3.5 px-3">
                                                    <span
                                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                                                        style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </td>

                                                {/* User */}
                                                <td className="py-3.5 px-3 text-xs text-[#6b6680] max-w-[130px] truncate">{userName}</td>

                                                {/* Error type */}
                                                <td className="py-3.5 px-3 text-[11px] font-mono text-[#a8a3bd] truncate max-w-[120px]">
                                                    {err.errorType || "—"}
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-3 text-xs text-[#6b6680]">{formatDateTime(err.createdAt)}</td>
                                            </tr>

                                            {/* Expanded metadata row (no stack traces) */}
                                            {isExpanded && err.metadata && (
                                                <tr key={`${err._id}-expanded`} className="bg-[#faf9ff] border-t border-[#f5f3ff]">
                                                    <td colSpan={5} className="px-5 py-3">
                                                        <p className="text-[11px] font-semibold text-[#a8a3bd] uppercase tracking-wider mb-1">Additional Context</p>
                                                        <pre className="text-xs text-[#3f3a52] bg-white border border-[#ecebf3] rounded-lg p-3 overflow-x-auto max-h-32 scrollbar-hide">
                                                            {JSON.stringify(err.metadata, null, 2)}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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
