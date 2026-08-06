import { useEffect, useState } from "react";
import { UploadCloud, CheckCircle2, Timer } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import StorageCard from "../components/StorageCard.jsx";
import RecentJobsTable from "../components/RecentJobsTable.jsx";
import AISummaryCard from "../components/AISummaryCard.jsx";
import VelocityChart from "../components/VelocityChart.jsx";
import ProFeatureCard from "../components/ProFeatureCard.jsx";
import api from "../services/api.js";

const STORAGE_LIMIT_GB = 20;

function formatMinutes(totalSeconds) {
    const mins = Math.round(totalSeconds / 60);
    return mins.toLocaleString();
}

function bytesToGb(bytes) {
    return parseFloat((bytes / (1024 ** 3)).toFixed(2));
}

export default function Dashboard() {
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/transcriptions")
            .then((res) => {
                if (res.data.success) {
                    setTranscriptions(res.data.data);
                }
            })
            .catch((err) => {
                console.error("Failed to load transcriptions:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Derive stats from real data
    const totalUploads = transcriptions.length;
    const completedJobs = transcriptions.filter((t) => t.status === "completed").length;
    const totalSeconds = transcriptions.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalBytes = transcriptions.reduce((sum, t) => sum + (t.fileSize || 0), 0);
    const usedGb = bytesToGb(totalBytes);

    // Five most recent for the table
    const recentJobs = transcriptions.slice(0, 5);

    return (
        <div className="flex flex-col gap-6">
            {/* Stat row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={UploadCloud}
                    label="Total Uploads"
                    value={loading ? "—" : totalUploads.toLocaleString()}
                    iconBg="#EDE9FE"
                    iconColor="#7c3aed"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Completed Jobs"
                    value={loading ? "—" : completedJobs.toLocaleString()}
                    iconBg="#F1F0F5"
                    iconColor="#3f3a52"
                />
                <StatCard
                    icon={Timer}
                    label="Minutes Processed"
                    value={loading ? "—" : formatMinutes(totalSeconds)}
                    iconBg="#EDE9FE"
                    iconColor="#7c3aed"
                />
                <StorageCard usedGb={usedGb} totalGb={STORAGE_LIMIT_GB} />
            </div>

            {/* Main content row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <RecentJobsTable jobs={recentJobs} loading={loading} />
                <div className="flex flex-col gap-5">
                    <AISummaryCard />
                    <VelocityChart />
                    <ProFeatureCard />
                </div>
            </div>
        </div>
    );
}
