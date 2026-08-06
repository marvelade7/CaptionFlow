import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/captionFlowLogo22.png";
import {
    LayoutGrid,
    UploadCloud,
    FolderOpen,
    FileText,
    Download,
    User,
    Settings as SettingsIcon,
    LogOut,
    X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

function NavItem({ to, label, icon: Icon, onClick }) {
    return (
        <NavLink
            to={to}
            end={true}
            onClick={onClick}
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

export default function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const logoutHandler = () => {
        if (onClose) onClose();
        logout();
        navigate("/login");
    };

    const sidebarContent = (
        <div className="flex h-full flex-col justify-between px-4 py-6">
            <div>
                {/* Brand & Mobile Close Button */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex items-center sm:gap-2 gap-1">
                        <img src={logo} alt="logo" className="sm:w-[50px] w-[50px]" />
                        <h3 className="text-lg font-semibold">
                            Caption<span className="font-bold text-[#7c3aed]">Flow</span>
                        </h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-sm text-purple-500 hover:bg-gray-100 lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Primary nav */}
                <nav className="flex flex-col gap-1.5">
                    {NAV_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} onClick={onClose} />
                    ))}
                </nav>

                {/* Preferences */}
                <p className="mb-1 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#a8a3bd]">
                    Preferences
                </p>
                <nav className="flex flex-col gap-1">
                    {PREFERENCE_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} onClick={onClose} />
                    ))}
                </nav>
            </div>

            {/* Logout */}
            <button
                type="button"
                onClick={logoutHandler}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
                <LogOut size={18} />
                Logout
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop static sidebar */}
            <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-[#ecebf3] bg-white">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            <div
                className={`fixed inset-0 z-50 flex lg:hidden transition-all duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={onClose}
                />

                {/* Drawer Content */}
                <aside
                    className={`relative z-10 w-72 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    {sidebarContent}
                </aside>
            </div>
        </>
    );
}
