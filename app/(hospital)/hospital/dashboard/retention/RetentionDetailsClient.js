"use client";

import { useRetentionKPI } from "@/hooks/useDashboard";
import { SkeletonCard, ErrorInline } from "@/components/dashboard/SkeletonCard";

export default function RetentionDetailsClient({ hospitalId }) {
    const { kpi, isLoading, isError, mutate } = useRetentionKPI(hospitalId);

    if (isLoading) return <SkeletonCard height="400px" />;
    if (isError) return <ErrorInline message="Failed to load retention details" onRetry={mutate} />;

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Performance by Care Pathway</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                    {kpi?.carePathways?.map(p => (
                        <div key={p.key} style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{p.label}</span>
                                <span style={{ fontWeight: "800", color: "#14b8a6" }}>{p.completionPct}%</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem" }}>{p.activeCount} active patients</div>
                            <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "999px" }}>
                                <div style={{ height: "6px", width: `${p.completionPct}%`, background: "#14b8a6", borderRadius: "999px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#92400e", marginBottom: "0.5rem" }}>Retention Insights</h3>
                <p style={{ fontSize: "0.875rem", color: "#b45309" }}>
                    Your overall retention rate of <strong>{kpi?.retentionRate}%</strong> is {kpi?.deltaVsLastMonth > 0 ? "up by " + kpi.deltaVsLastMonth + "%" : "down"} compared to last month. 
                    The network average in Patna is 63%.
                </p>
            </div>
        </div>
    );
}
