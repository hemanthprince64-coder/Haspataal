import { services } from "@/lib/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BillingForm from "./BillingForm";

export default async function BillingPage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_user");

    if (!userCookie) redirect("/hospital/login");
    const user = JSON.parse(userCookie.value);

    const doctors = services.hospital.getDoctors(user.hospitalId);

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>OPD & Billing</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Create a new OPD visit and generate billing</p>
            <BillingForm doctors={doctors} />
        </div>
    );
}
