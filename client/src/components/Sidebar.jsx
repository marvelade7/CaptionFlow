import { NavLink } from "react-router-dom";
import {
    LayoutGrid,
    UploadCloud,
    FolderOpen,
    FileText,
    Download,
    User,
    Settings as SettingsIcon,
    LogOut,
    AudioLines,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
    { to: "/dashboard/upload", label: "Upload", icon: UploadCloud },
    { to: "/dashboard/my-files", label: "My Files", icon: FolderOpen },
    { to: "/dashboard/transcripts", label: "Transcripts", icon: FileText },
    { to: "/dashboard/downloads", label: "Downloads", icon: Download },
];
const PREFERENCE_ITEMS = [
    { to: "/dashboard/account", label: "Account", icon: User },
    { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

function NavItem({ to, label, icon: Icon }) {
    return (
        <NavLink
            to={to}
            end={true}
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                        ? "bg-[#7c3aed] text-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]"
                        : "text-[#3f3a52] hover:bg-[#f5f3ff] hover:text-[#6d28d9]"
                }`
            }
        >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    return (
        <aside className="flex h-full w-70 shrink-0 flex-col justify-between border-r border-[#ecebf3] bg-white px-4 py-6">
            <div>
                {/* Brand */}
                <div className="mb-10 flex items-center gap-2 px-2">
                    <img src="./captionFlowLogo22.png" width="50" />
                    <h3 className="text-lg font-semibold text-[#7c3aed]">
                        CaptionFlow
                    </h3>
                </div>

                {/* Primary nav */}
                <nav className="flex flex-col gap-2">
                    {NAV_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </nav>

                {/* Preferences */}
                <p className="mb-1 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#a8a3bd]">
                    Preferences
                </p>
                <nav className="flex flex-col gap-1">
                    {PREFERENCE_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </nav>
            </div>

            {/* Logout */}
            <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
                <LogOut size={18} />
                Logout
            </button>
        </aside>
    );
}
