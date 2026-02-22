import { services } from "@/lib/services";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import BillingForm from "./BillingForm";

export default async function BillingPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");
    const doctors = await services.hospital.getDoctors(user.hospitalId);

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>OPD & Billing</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Create a new OPD visit and generate billing</p>
            <BillingForm doctors={doctors} />
        </div>
    );
}
