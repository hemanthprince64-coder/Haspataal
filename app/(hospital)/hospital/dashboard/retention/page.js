import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import RetentionDetailsClient from "./RetentionDetailsClient";

export default async function RetentionPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Retention Engine</h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Deep dive into patient recovery and follow-up analytics</p>
            <RetentionDetailsClient hospitalId={user.hospitalId} />
        </div>
    );
}
