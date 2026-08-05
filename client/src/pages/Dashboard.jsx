import { UploadCloud, CheckCircle2, Timer } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import StorageCard from "../components/StorageCard.jsx";
import RecentJobsTable from "../components/RecentJobsTable.jsx";
import AISummaryCard from "../components/AISummaryCard.jsx";
import VelocityChart from "../components/VelocityChart.jsx";
import ProFeatureCard from "../components/ProFeatureCard.jsx";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6">
            {/* Stat row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={UploadCloud}
                    label="Total Uploads"
                    value="128"
                    delta="+12%"
                    iconBg="#EDE9FE"
                    iconColor="#7c3aed"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Completed Jobs"
                    value="114"
                    iconBg="#F1F0F5"
                    iconColor="#3f3a52"
                />
                <StatCard
                    icon={Timer}
                    label="Minutes Processed"
                    value="2,450"
                    iconBg="#EDE9FE"
                    iconColor="#7c3aed"
                />
                <StorageCard usedGb={14.2} totalGb={20} />
            </div>

            {/* Main content row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <RecentJobsTable />
                <div className="flex flex-col gap-5">
                    <AISummaryCard />
                    <VelocityChart />
                    <ProFeatureCard />
                </div>
            </div>
        </div>
    );
}
