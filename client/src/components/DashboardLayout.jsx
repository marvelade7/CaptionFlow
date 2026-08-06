import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import AOS from "aos";



export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { pathname } = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        AOS.refresh();
    }, [pathname]);

    const PAGE_META = {
        "/dashboard": {
            title: `Welcome back, ${user?.firstName || "User"}`,
            subtitle:
                "Your transcriptions are processing with 99% accuracy today.",
        },
        "/dashboard/upload": {
            title: "Upload",
            subtitle: "Add new audio or video files for transcription.",
        },
        "/dashboard/my-files": {
            title: "My Files",
            subtitle: "Everything you have uploaded, in one place.",
        },
        "/dashboard/transcripts": {
            title: "Transcripts",
            subtitle: "Browse and search your completed transcripts.",
        },
        "/dashboard/downloads": {
            title: "Downloads",
            subtitle: "Export-ready files, available anytime.",
        },
        "/dashboard/account": {
            title: "Account",
            subtitle: "Manage your profile and subscription.",
        },
        "/dashboard/settings": {
            title: "Settings",
            subtitle: "Configure CaptionFlow to fit your workflow.",
        },
    };

    const meta = PAGE_META[pathname] ?? { title: "CaptionFlow", subtitle: "" };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f4f3f8]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex h-full flex-1 flex-col overflow-y-auto">
                <Topbar
                    title={meta.title}
                    subtitle={meta.subtitle}
                    showDate={pathname === "/dashboard"}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 px-4 sm:px-8 p-8 pt-4">
                    <div
                        key={pathname}
                        className=""
                    >
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
