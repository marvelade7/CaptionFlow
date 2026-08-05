import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const PAGE_META = {
        "/dashboard": {
            title: `Welcome back, ${user?.firstName} ${user?.lastName}`,
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
            <Sidebar />
            <div className="flex h-full flex-1 flex-col overflow-y-auto">
                <Topbar title={meta.title} subtitle={meta.subtitle} />
                <main className="flex-1 px-8 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
