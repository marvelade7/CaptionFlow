import { Plus, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar({ title, subtitle, showDate = false }) {
    const { user } = useAuth();
    const userName = user ? `${user.firstName} ${user.lastName}` : "User";

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="flex items-center justify-between px-8 py-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0f0b1f]">{title}</h1>
                {showDate && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#7c3aed]">
                        <CalendarDays size={14} strokeWidth={2} />
                        {today}
                    </p>
                )}
                {subtitle && (
                    <p className="mt-1 text-sm text-[#6b6680]">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Link
                    to="/dashboard/upload"
                    className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    New Upload
                </Link>
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#ede9fe] ring-2 ring-white">
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

