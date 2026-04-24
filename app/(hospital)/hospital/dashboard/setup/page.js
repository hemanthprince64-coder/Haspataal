import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";

export default async function SetupPage() {
    await requireRole([UserRole.HOSPITAL_ADMIN], "session_user");
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚙️</div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.5rem" }}>Hospital Setup Wizard</h1>
            <p style={{ color: "#64748b", maxWidth: "400px", fontSize: "1.1rem" }}>Configure departments, staff roles, and facility settings coming soon.</p>
            <div style={{ marginTop: "2rem", padding: "0.5rem 1rem", borderRadius: "999px", background: "#f1f5f9", color: "#475569", fontSize: "0.875rem", fontWeight: "600" }}>🚀 Phase 2 Maintenance in Progress</div>
        </div>
    );
}
