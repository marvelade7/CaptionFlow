import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Shield, User as UserIcon, Mail,
    Calendar, Clock, UploadCloud, Download, Activity,
} from "lucide-react";
import { getAdminUser, getAdminTranscriptions } from "../../services/adminApi.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso, opts = {}) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
        ...opts,
    });
}

function formatSeconds(s) {
    if (!s) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const STATUS_MAP = {
    uploaded:   { label: "Uploaded",   cls: "bg-blue-50 text-blue-500" },
    queued:     { label: "Queued",     cls: "bg-amber-50 text-amber-500" },
    processing: { label: "Processing", cls: "bg-[#f5f3ff] text-[#7c3aed]" },
    completed:  { label: "Completed",  cls: "bg-emerald-50 text-emerald-600" },
    failed:     { label: "Failed",     cls: "bg-red-50 text-red-500" },
};

// ── Stat pill ─────────────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-[#ecebf3] bg-[#faf9ff] p-4">
            <div className="flex items-center gap-1.5 text-[#a8a3bd]">
                <Icon size={13} strokeWidth={2} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xl font-bold text-[#0f0b1f]">{value}</p>
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "h-5 w-32" }) {
    return <div className={`animate-pulse rounded-lg bg-[#f1f0f5] ${className}`} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser]             = useState(null);
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [txLoading, setTxLoading]   = useState(true);

    useEffect(() => {
        setLoading(true);
        getAdminUser(id)
            .then((res) => { if (res.data.success) setUser(res.data.data); })
            .catch(() => {})
            .finally(() => setLoading(false));

        setTxLoading(true);
        getAdminTranscriptions({ page: 1, limit: 10, userId: id })
            .then((res) => { if (res.data.success) setTranscriptions(res.data.data); })
            .catch(() => {})
            .finally(() => setTxLoading(false));
    }, [id]);

    if (!loading && !user) {
        return (
            <div className="rounded-2xl border border-[#ecebf3] bg-white p-10 text-center text-sm text-[#a8a3bd]">
                User not found.{" "}
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#7c3aed] font-semibold hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    const name = user ? `${user.firstName} ${user.lastName}` : "";
    const totalAudio = transcriptions.reduce((s, t) => s + (t.duration || 0), 0);
    const completed = transcriptions.filter((t) => t.status === "completed").length;

    return (
        <div className="flex flex-col gap-5">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-[#7c3aed] hover:text-[#6d28d9] font-semibold w-fit"
            >
                <ArrowLeft size={15} />
                All Users
            </button>

            {/* Profile card */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-[#ede9fe] shrink-0">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-[#f1f0f5]" />
                        ) : (
                            <img
                                src={user?.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`}
                                alt={name}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-[#0f0b1f]">{name}</h2>
                                <div className="flex items-center gap-1.5 mt-1 text-sm text-[#6b6680]">
                                    <Mail size={13} />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                        user?.role === "admin"
                                            ? "bg-[#ede9fe] text-[#7c3aed] border-[#d4c8f7]"
                                            : "bg-[#f1f0f5] text-[#6b6680] border-[#ecebf3]"
                                    }`}>
                                        {user?.role === "admin" ? <Shield size={10} /> : <UserIcon size={10} />}
                                        {user?.role}
                                    </span>
                                    {user?.isVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-100">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Detail rows */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-[#ecebf3] pt-5">
                    {[
                        { icon: Calendar, label: "Joined", value: loading ? null : formatDate(user?.createdAt) },
                        { icon: Clock, label: "Last Login", value: loading ? null : formatDate(user?.lastLoginAt) },
                        { icon: Activity, label: "Last Activity", value: loading ? null : formatDate(user?.lastActivityAt) },
                        { icon: UserIcon, label: "Total Logins", value: loading ? null : (user?.loginCount || 0).toLocaleString() },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2.5 text-sm">
                            <Icon size={14} className="text-[#a8a3bd] shrink-0" />
                            <span className="text-[#6b6680] w-28 shrink-0">{label}</span>
                            {value === null ? (
                                <Skeleton className="h-4 w-32" />
                            ) : (
                                <span className="font-medium text-[#0f0b1f]">{value}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage stats */}
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a3bd] mb-3 px-1">Usage Statistics</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat icon={UploadCloud} label="Uploads" value={txLoading ? "—" : transcriptions.length.toLocaleString()} />
                    <Stat icon={Download} label="Completed" value={txLoading ? "—" : completed.toLocaleString()} />
                    <Stat icon={Clock} label="Audio Processed" value={txLoading ? "—" : formatSeconds(totalAudio)} />
                    <Stat icon={UserIcon} label="Total Logins" value={loading ? "—" : (user?.loginCount || 0).toLocaleString()} />
                </div>
            </div>

            {/* Recent transcriptions */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] overflow-hidden">
                <div className="p-5 border-b border-[#ecebf3] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0f0b1f]">Transcription History</h3>
                    <Link
                        to={`/dashboard/admin/transcriptions?userId=${id}`}
                        className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9]"
                    >
                        View all →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-[#a8a3bd]">
                                <th className="pb-3 pt-4 px-5 font-semibold">File</th>
                                <th className="pb-3 pt-4 px-3 font-semibold">Status</th>
                                <th className="pb-3 pt-4 px-3 font-semibold">Duration</th>
                                <th className="pb-3 pt-4 px-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-t border-[#ecebf3] animate-pulse">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <td key={j} className="py-4 px-3">
                                                <div className="h-3.5 w-3/4 rounded bg-[#f1f0f5]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : transcriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-sm text-[#a8a3bd]">
                                        No transcriptions yet.
                                    </td>
                                </tr>
                            ) : (
                                transcriptions.map((t) => {
                                    const st = STATUS_MAP[t.status] ?? { label: t.status, cls: "bg-[#f1f0f5] text-[#6b6680]" };
                                    const dur = t.duration
                                        ? `${Math.floor(t.duration / 60)}:${String(Math.round(t.duration % 60)).padStart(2, "0")}`
                                        : "—";
                                    return (
                                        <tr key={t._id} className="border-t border-[#ecebf3]">
                                            <td className="py-3.5 px-5 font-medium text-[#0f0b1f] max-w-[220px] truncate" title={t.originalFileName}>
                                                {t.originalFileName}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{dur}</td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatDate(t.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
