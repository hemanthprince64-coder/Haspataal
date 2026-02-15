import { auth } from "@/auth"; // Fixed import path
import { redirect } from "next/navigation";
import { getHospitalStats } from "@/app/actions/analytics"; // Fixed import path
import { AppointmentsTrendChart, RevenueChart, TopDoctorsChart } from "./Charts";
import { ROLES } from "@/lib/permissions";

export default async function AnalyticsPage() {
    const session = await auth();
    // Allow Hospital Admin or Doctor (if authorized)
    if (!session || !session.user) redirect('/login');
    // Ideally check for permissions more strictly

    const { stats, error } = await getHospitalStats();

    if (error) {
        return <div className="page-enter">Error: {error}</div>;
    }

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "1.5rem" }}>Analytics Dashboard</h1>

            {/* Metrics Cards */}
            <div className="grid-layout" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "2rem" }}>
                <div className="card text-center">
                    <h3 className="text-muted">Total Patients</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{stats.totalPatients}</div>
                </div>
                <div className="card text-center">
                    <h3 className="text-muted">Total Revenue</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>₹{stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="card text-center">
                    <h3 className="text-muted">Pending Appts</h3>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>{stats.pendingAppointments}</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid-layout" style={{ marginBottom: "2rem" }}>
                <div className="card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Appointments Trend (Last 7 Days)</h3>
                    <AppointmentsTrendChart data={stats.appointmentsTrend} />
                </div>
                <div className="card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Weekly Revenue</h3>
                    <RevenueChart data={stats.revenueTrend} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid-layout" style={{ gridTemplateColumns: "1fr" }}>
                <div className="card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Top Performing Doctors</h3>
                    <div style={{ height: "350px", display: "flex", justifyContent: "center" }}>
                        <TopDoctorsChart data={stats.topDoctors} />
                    </div>
                </div>
            </div>
        </div>
    );
}
