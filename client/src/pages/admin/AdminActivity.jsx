import { useEffect, useState, useCallback } from "react";
import { getAdminActivity } from "../../services/adminApi.js";
import Pagination from "../../components/Pagination.jsx";
import {
    UserPlus, LogIn, LogOut, UploadCloud, FileText,
    CheckCircle2, XCircle, Download, Sparkles, User,
    Settings, Trash2, Activity as ActivityIcon,
} from "lucide-react";

// ── Event type config ─────────────────────────────────────────────────────────

const EVENT_CONFIG = {
    USER_REGISTERED:          { label: "Signed up",                icon: UserPlus,     bg: "#ECFDF5", color: "#10b981" },
    USER_LOGGED_IN:           { label: "Logged in",                icon: LogIn,        bg: "#EDE9FE", color: "#7c3aed" },
    USER_LOGOUT:              { label: "Logged out",               icon: LogOut,       bg: "#F1F0F5", color: "#6b6680" },
    FILE_UPLOADED:            { label: "Uploaded a file",          icon: UploadCloud,  bg: "#EDE9FE", color: "#7c3aed" },
    TRANSCRIPTION_STARTED:    { label: "Started transcription",    icon: FileText,     bg: "#FFFBEB", color: "#f59e0b" },
    TRANSCRIPTION_COMPLETED:  { label: "Completed transcription",  icon: CheckCircle2, bg: "#ECFDF5", color: "#10b981" },
    TRANSCRIPTION_FAILED:     { label: "Transcription failed",     icon: XCircle,      bg: "#FEF2F2", color: "#ef4444" },
    FILE_DOWNLOADED:          { label: "Downloaded a file",        icon: Download,     bg: "#EFF6FF", color: "#3b82f6" },
    SUMMARY_GENERATED:        { label: "Generated AI summary",     icon: Sparkles,     bg: "#EDE9FE", color: "#7c3aed" },
    EXCERPTS_GENERATED:       { label: "Generated excerpts",       icon: Sparkles,     bg: "#EDE9FE", color: "#7c3aed" },
    ACCOUNT_UPDATED:          { label: "Updated account",          icon: Settings,     bg: "#F1F0F5", color: "#6b6680" },
    ACCOUNT_DELETED:          { label: "Deleted account",          icon: Trash2,       bg: "#FEF2F2", color: "#ef4444" },
};

const DEFAULT_EVENT = { label: "Unknown event", icon: ActivityIcon, bg: "#F1F0F5", color: "#6b6680" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <div className="flex items-start gap-4 py-4 border-b border-[#f5f3ff] animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-[#f1f0f5] shrink-0 mt-0.5" />
            <div className="flex-1">
                <div className="h-3.5 w-2/3 rounded bg-[#f1f0f5] mb-2" />
                <div className="h-3 w-1/3 rounded bg-[#f5f3ff]" />
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminActivity() {
    const [activity, setActivity]     = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 30 });
    const [page, setPage]             = useState(1);
    const [loading, setLoading]       = useState(true);

    const fetchActivity = useCallback(() => {
        setLoading(true);
        getAdminActivity({ page, limit: 30 })
            .then((res) => {
                if (res.data.success) {
                    setActivity(res.data.data);
                    setPagination(res.data.pagination);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => { fetchActivity(); }, [fetchActivity]);

    return (
        <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-[#0f0b1f]">
                        Activity Feed
                        {!loading && (
                            <span className="ml-2 text-xs font-normal text-[#a8a3bd]">
                                ({pagination.total.toLocaleString()} events)
                            </span>
                        )}
                    </h2>
                    <div className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-50 animate-pulse" title="Live" />
                </div>
                <p className="text-xs text-[#a8a3bd] mb-5">All platform events across every user, most recent first.</p>

                {/* Feed */}
                <div>
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : activity.length === 0 ? (
                        <p className="text-sm text-[#a8a3bd] text-center py-12">No activity recorded yet.</p>
                    ) : (
                        activity.map((log, idx) => {
                            const cfg = EVENT_CONFIG[log.eventType] || DEFAULT_EVENT;
                            const Icon = cfg.icon;
                            const user = log.user;
                            const name = user ? `${user.firstName} ${user.lastName}` : "Unknown user";
                            const isLast = idx === activity.length - 1;

                            return (
                                <div
                                    key={log._id}
                                    className={`flex items-start gap-4 py-4 ${!isLast ? "border-b border-[#f5f3ff]" : ""}`}
                                >
                                    {/* Icon badge */}
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ backgroundColor: cfg.bg }}
                                    >
                                        <Icon size={16} style={{ color: cfg.color }} strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#0f0b1f] leading-snug">
                                            <span className="font-semibold">{name}</span>
                                            {" "}
                                            <span className="text-[#6b6680]">{cfg.label.toLowerCase()}</span>
                                            {log.metadata?.filename && (
                                                <span className="text-[#7c3aed] font-medium"> — {log.metadata.filename}</span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <p className="text-[11px] text-[#a8a3bd]">{formatDateTime(log.createdAt)}</p>
                                            {user?.email && (
                                                <p className="text-[11px] text-[#a8a3bd] truncate max-w-[200px]">{user.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Event type badge */}
                                    <span
                                        className="hidden sm:inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                    >
                                        {log.eventType.replace(/_/g, " ")}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="mt-4">
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
