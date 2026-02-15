import { services } from "@/lib/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DoctorManagement from "./DoctorManagement";

export default async function DoctorsPage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_user");

    if (!userCookie) redirect("/hospital/login");
    const user = JSON.parse(userCookie.value);

    if (user.role !== 'ADMIN') {
        return (
            <div className="page-enter" style={{ padding: "3rem", textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p style={{ color: "var(--text-muted)" }}>Only hospital admins can manage doctors.</p>
            </div>
        );
    }

    const doctors = services.hospital.getDoctors(user.hospitalId);

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Manage Doctors</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Add, view, and manage your hospital's doctors</p>
            <DoctorManagement doctors={doctors} />
        </div>
    );
}
