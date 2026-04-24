import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Notification Engine</h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Monitor WhatsApp and SMS communication streams</p>
            <NotificationsClient hospitalId={user.hospitalId} />
        </div>
    );
}
