import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Shield, User as UserIcon } from "lucide-react";
import { getAdminUsers } from "../../services/adminApi.js";
import Pagination from "../../components/Pagination.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

const ROLE_BADGE = {
    admin: "bg-[#ede9fe] text-[#7c3aed] border border-[#d4c8f7]",
    user:  "bg-[#f1f0f5] text-[#6b6680] border border-[#ecebf3]",
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

export default function AdminUsers() {
    const [users, setUsers]           = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
    const [search, setSearch]         = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage]             = useState(1);
    const [loading, setLoading]       = useState(true);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getAdminUsers({ page, limit: 20, search })
            .then((res) => {
                if (res.data.success) {
                    setUsers(res.data.data);
                    setPagination(res.data.pagination);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Debounce search — only fires after user stops typing for 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <div className="flex flex-col gap-5">
            {/* Search bar */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a3bd]" />
                    <input
                        id="admin-user-search"
                        type="text"
                        placeholder="Search by name or email…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full rounded-xl border border-[#ecebf3] bg-[#faf9ff] py-2.5 pl-9 pr-4 text-sm placeholder-[#a8a3bd] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)] overflow-hidden">
                <div className="p-5 pb-0">
                    <h2 className="text-sm font-bold text-[#0f0b1f]">
                        All Users
                        {!loading && (
                            <span className="ml-2 text-xs font-normal text-[#a8a3bd]">
                                ({pagination.total.toLocaleString()} total)
                            </span>
                        )}
                    </h2>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-[#a8a3bd] border-b border-[#ecebf3]">
                                <th className="pb-3 pt-1 px-5 font-semibold">User</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Role</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Joined</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Last Login</th>
                                <th className="pb-3 pt-1 px-3 font-semibold">Logins</th>
                                <th className="pb-3 pt-1 px-3 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center text-sm text-[#a8a3bd]">
                                        {search ? `No users match "${search}"` : "No users found."}
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const name = `${u.firstName} ${u.lastName}`;
                                    return (
                                        <tr
                                            key={u._id}
                                            className="border-t border-[#ecebf3] hover:bg-[#faf9ff] transition-colors"
                                        >
                                            {/* Avatar + Name + Email */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-[#ede9fe] shrink-0">
                                                        <img
                                                            src={u.profilePicture || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`}
                                                            alt={name}
                                                            className="h-full w-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[#0f0b1f] truncate max-w-[180px]">{name}</p>
                                                        <p className="text-xs text-[#a8a3bd] truncate max-w-[180px]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                                                    {u.role === "admin" ? <Shield size={10} /> : <UserIcon size={10} />}
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatDate(u.createdAt)}</td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs">{formatDate(u.lastLoginAt)}</td>
                                            <td className="py-3.5 px-3 text-[#6b6680] text-xs font-semibold">{(u.loginCount || 0).toLocaleString()}</td>
                                            <td className="py-3.5 px-3">
                                                <Link
                                                    to={`/dashboard/admin/users/${u._id}`}
                                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#7c3aed] hover:bg-[#f5f3ff] transition-colors"
                                                    aria-label={`View details for ${name}`}
                                                >
                                                    View <ChevronRight size={13} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
