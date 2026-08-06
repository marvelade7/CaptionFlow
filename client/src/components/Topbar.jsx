import { Plus, CalendarDays, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar({ title, subtitle, showDate = false, onMenuClick }) {
    const { user } = useAuth();
    const userName = user ? `${user.firstName} ${user.lastName}` : "User";

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <header className="flex sticky top-0 z-10 flex-wrap items-center justify-between gap-4 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 shadow-sm lg:border-none bg-white">
            <div className="flex items-center gap-5 pt-5">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-md bg-[#7c3aed] text-white border-none active:bg-[#6d28d9] active:text-[#f5f3ff] lg:hidden"
                    aria-label="Open sidebar menu"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0f0b1f]">{title}</h1>
                    {showDate && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm text-[#7c3aed]">
                            <CalendarDays size={14} strokeWidth={2} />
                            {today}
                        </p>
                    )}
                    {subtitle && (
                        <p className="mt-0.5 text-xs sm:text-sm text-[#6b6680] hidden sm:block">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                <Link
                    to="/dashboard/upload"
                    className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">New Upload</span>
                    <span className="sm:hidden">Upload</span>
                </Link>
                <div className="h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full bg-[#ede9fe] ring-2 ring-white shrink-0">
                    <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`}
                        alt={userName}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}

