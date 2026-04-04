import { services } from "@/lib/services";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import Link from "next/link";

import HospitalDashboardClient from "@/components/hospital/HospitalDashboardClient";

export default async function DashboardPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");
    const hospital = await services.platform.getHospitalById(user.hospitalId);

    return <HospitalDashboardClient user={user} initialHospital={hospital} />;
}
