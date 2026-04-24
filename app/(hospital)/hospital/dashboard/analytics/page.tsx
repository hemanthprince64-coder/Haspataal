import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Advanced Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time performance metrics and growth intelligence</p>
      </div>
      
      <AnalyticsClient hospitalId={user.hospitalId} />
    </div>
  );
}
