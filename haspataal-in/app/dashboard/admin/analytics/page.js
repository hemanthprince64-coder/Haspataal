import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/app/actions/analytics";
import { HospitalGrowthChart, CityDistributionChart } from "./AdminCharts";

export default async function AdminAnalyticsPage() {
    const session = await auth();
    if (!session || !session.user) redirect('/login'); // Add Super Admin check

    const { stats, error } = await getAdminStats();

    if (error) return <div className="page-enter">Error: {error}</div>;

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "1.5rem" }}>Platform Analytics (Admin)</h1>

            {/* Metrics Cards */}
            <div className="grid-layout" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "2rem" }}>
                <div className="card text-center" style={{ borderLeft: "4px solid #3b82f6" }}>
                    <h3 className="text-muted">Total Hospitals</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{stats.totalHospitals}</div>
                    <div style={{ fontSize: "0.9rem", color: "green" }}>{stats.activeHospitals} Active</div>
                </div>
                <div className="card text-center" style={{ borderLeft: "4px solid #10b981" }}>
                    <h3 className="text-muted">Total Doctors</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>{stats.totalDoctors}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: "4px solid #8b5cf6" }}>
                    <h3 className="text-muted">Total Patients</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5cf6" }}>{stats.totalPatients.toLocaleString()}</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-layout" style={{ marginBottom: "2rem" }}>
                <div className="card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Hospital Growth</h3>
                    <HospitalGrowthChart data={stats.hospitalGrowth} />
                </div>
                <div className="card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>City-wise Distribution</h3>
                    <CityDistributionChart data={stats.cityDistribution} />
                </div>
            </div>
        </div>
    );
}
