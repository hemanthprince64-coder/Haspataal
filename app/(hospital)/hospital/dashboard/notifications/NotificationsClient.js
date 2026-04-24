"use client";

import { useNotifications } from "@/hooks/useDashboard";
import { SkeletonCard, ErrorInline } from "@/components/dashboard/SkeletonCard";

export default function NotificationsClient({ hospitalId }) {
    const { notif, isLoading, isError, mutate } = useNotifications(hospitalId);

    if (isLoading) return <SkeletonCard height="400px" />;
    if (isError) return <ErrorInline message="Failed to load notification status" onRetry={mutate} />;

    const stats = [
        { label: "WhatsApp", ...notif?.whatsapp, color: "#22c55e" },
        { label: "SMS", ...notif?.sms, color: "#3b82f6" },
        { label: "Push", ...notif?.push, color: "#a855f7" },
    ];

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>{s.label} Delivery</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Sent</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: "800" }}>{s.sent}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Delivered</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: s.color }}>{s.delivered}</div>
                            </div>
                        </div>
                        <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px" }}>
                            <div style={{ height: "6px", width: `${s.sent ? Math.round(s.delivered / s.sent * 100) : 0}%`, background: s.color, borderRadius: "999px" }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Upcoming Automation</h3>
                <div style={{ padding: "1rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>Nightly Follow-up Batch</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Scheduled for 8:00 PM tonight</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: "800", color: "#0f172a" }}>{notif?.scheduledTonight}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Messages</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
