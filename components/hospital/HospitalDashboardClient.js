"use client";

import { useState } from "react";
import Link from "next/link";
import { useMetrics, useRetentionKPI, useFollowups, useEvents, useNotifications, useRevenue } from "@/hooks/useDashboard";
import { formatINR } from "@/lib/format";
import { MetricSkeleton, SkeletonCard, ErrorInline } from "@/components/dashboard/SkeletonCard";

const PATHWAY_COLORS = { pregnancy: "#a855f7", pediatrics: "#14b8a6", chronic: "#f59e0b", opd_general: "#3b82f6" };
const URGENCY_DOT = { urgent: "#ef4444", soon: "#f59e0b", scheduled: "#22c55e", missed: "#94a3b8" };
const EVENT_COLORS = { patient_discharged: "#f59e0b", followup_created: "#14b8a6", bill_paid: "#22c55e", notification_sent: "#818cf8", patient_admitted: "#ef4444", doctor_prescribes: "#0ea5e9", patient_registered: "#3b82f6", patient_visited: "#14b8a6" };

// ─── MetricCard ───
function MetricCard({ label, value, sub, color, icon, delta }) {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", borderLeft: `3px solid ${color}`, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                <span style={{ fontSize: "1.25rem" }}>{icon}</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>{value}</div>
            {delta && <div style={{ fontSize: "0.72rem", color, fontWeight: "600" }}>{delta}</div>}
            {sub && <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{sub}</div>}
        </div>
    );
}

// ─── RetentionCard ───
function RetentionCard({ kpi, isLoading, isError, mutate }) {
    if (isLoading) return <SkeletonCard height="340px" />;
    if (isError) return <ErrorInline message="Retention data failed" onRetry={mutate} />;
    const pct = kpi?.retentionRate ?? 0;
    const r = 44, circ = 2 * Math.PI * r;
    const pathways = kpi?.carePathways || [];
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Retention Engine</span>
                <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#d97706", padding: "0.1rem 0.5rem", borderRadius: "999px", fontWeight: "600" }}>★ The Moat</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#14b8a6" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s ease" }} />
                    <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">{pct}%</text>
                </svg>
                <div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: "0.35rem" }}>Discharged → Follow-up (30d)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#14b8a6" }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: "600" }}>Your hospital {pct}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#e5e7eb" }} />
                            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Network avg {kpi?.networkAvg ?? 63}%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {pathways.map(p => (
                    <div key={p.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "#374151", fontWeight: "500" }}>{p.label}</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: PATHWAY_COLORS[p.key] || "#6b7280" }}>{p.completionPct}%</span>
                        </div>
                        <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "999px" }}>
                            <div style={{ height: "5px", width: `${p.completionPct}%`, background: PATHWAY_COLORS[p.key] || "#6b7280", borderRadius: "999px", transition: "width 0.8s ease" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── EventLogCard ───
function EventLogCard({ events, isLoading, isError, mutate }) {
    if (isLoading) return <SkeletonCard height="340px" />;
    if (isError) return <ErrorInline message="Event feed failed" onRetry={mutate} />;
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem", height: "100%" }}>
            <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}.pulse-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse-dot 1.5s ease-in-out infinite}`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div className="pulse-dot" />
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Live EventLog</span>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#9ca3af" }}>Stream</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {events.map(ev => (
                    <div key={ev.id} style={{ display: "flex", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid #f8fafc", alignItems: "flex-start", borderLeft: `2px solid ${EVENT_COLORS[ev.eventType] || "#94a3b8"}`, paddingLeft: "0.75rem", marginLeft: "-1.25rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#9ca3af", whiteSpace: "nowrap", paddingTop: "0.1rem" }}>{ev.timeLabel}</span>
                        <div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: "600", color: EVENT_COLORS[ev.eventType] || "#6b7280" }}>{ev.eventType}</div>
                            <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{ev.label}</div>
                        </div>
                    </div>
                ))}
                {events.length === 0 && <div style={{ color: "#9ca3af", fontSize: "0.8rem", textAlign: "center", padding: "1.5rem" }}>No events yet today</div>}
            </div>
        </div>
    );
}

// ─── FollowUpQueue ───
function FollowUpQueue({ hospitalId }) {
    const [tab, setTab] = useState("pending");
    const pending = useFollowups(hospitalId, "pending");
    const missed = useFollowups(hospitalId, "missed");
    const active = tab === "pending" ? pending : missed;
    const rows = active.followups?.items || [];

    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Pending Follow-ups</span>
                {(pending.followups?.urgent ?? 0) > 0 && <span style={{ fontSize: "0.68rem", background: "#fef2f2", color: "#dc2626", fontWeight: "700", padding: "0.1rem 0.5rem", borderRadius: "999px" }}>{pending.followups.urgent} urgent</span>}
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
                    {[["pending", "Due Soon"], ["missed", `Missed (${missed.followups?.total ?? 0})`]].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)} style={{ fontSize: "0.72rem", fontWeight: "600", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid", borderColor: tab === k ? "#14b8a6" : "#e5e7eb", background: tab === k ? "#f0fdfa" : "transparent", color: tab === k ? "#0d9488" : "#6b7280", cursor: "pointer" }}>{l}</button>
                    ))}
                </div>
            </div>
            {active.isError && <ErrorInline message="Follow-ups failed" onRetry={active.mutate} />}
            {active.isLoading ? <SkeletonCard height="160px" /> : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                        <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {["", "Patient", "Pathway / Doctor", "Due", ""].map((h, i) => (
                                <th key={i} style={{ textAlign: "left", padding: "0.4rem 0.5rem", fontWeight: "600", color: "#9ca3af", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {rows.map(f => (
                                <tr key={f.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                    <td style={{ padding: "0.55rem 0.5rem" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: URGENCY_DOT[f.urgency] || "#9ca3af" }} /></td>
                                    <td style={{ padding: "0.55rem 0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "700", color: "#475569", flexShrink: 0 }}>{f.initials}</div>
                                            <span style={{ fontWeight: "600", color: "#0f172a" }}>{f.patientName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "0.55rem 0.5rem" }}>
                                        <span style={{ fontSize: "0.68rem", background: (PATHWAY_COLORS[f.carePathway] || "#3b82f6") + "18", color: PATHWAY_COLORS[f.carePathway] || "#3b82f6", fontWeight: "700", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{f.pathwayLabel}</span>
                                        <div style={{ color: "#9ca3af", fontSize: "0.68rem", marginTop: "0.1rem" }}>{f.doctorName}</div>
                                    </td>
                                    <td style={{ padding: "0.55rem 0.5rem", color: f.urgency === "urgent" ? "#dc2626" : "#374151", fontWeight: f.urgency === "urgent" ? "700" : "500" }}>{f.dueDateLabel}</td>
                                    <td style={{ padding: "0.55rem 0.5rem" }}>
                                        <button onClick={() => { fetch(`/api/hospitals/${hospitalId}/followups/${f.id}/remind`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: "auto" }), credentials: "include" }).then(() => active.mutate()); }} style={{ fontSize: "0.68rem", fontWeight: "600", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid #14b8a6", background: "transparent", color: "#0d9488", cursor: "pointer", whiteSpace: "nowrap" }}>Send reminder</button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem" }}>No follow-ups in this queue</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── NotificationCard ───
function NotificationCard({ data, isLoading, isError, mutate }) {
    if (isLoading) return <SkeletonCard height="200px" />;
    if (isError) return <ErrorInline message="Notifications failed" onRetry={mutate} />;
    const channels = [
        { ch: "WhatsApp", icon: "💬", sent: data?.whatsapp?.sent ?? 0, delivered: data?.whatsapp?.delivered ?? 0, color: "#22c55e" },
        { ch: "SMS Fallback", icon: "📱", sent: data?.sms?.sent ?? 0, delivered: data?.sms?.delivered ?? 0, color: "#3b82f6" },
    ];
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.75rem" }}>Today&apos;s Sends</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                {channels.map(c => (
                    <div key={c.ch} style={{ padding: "0.75rem", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "1rem" }}>{c.icon}</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#374151" }}>{c.ch}</span>
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>{c.sent}</div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>sent · {c.delivered} delivered</div>
                        <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "999px", marginTop: "0.4rem" }}>
                            <div style={{ height: "4px", width: `${c.sent ? Math.round(c.delivered / c.sent * 100) : 0}%`, background: c.color, borderRadius: "999px" }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.6rem 0.75rem", fontSize: "0.75rem", color: "#92400e", fontWeight: "500" }}>
                ⏰ Scheduled for tonight: <strong>{data?.scheduledTonight ?? 0} reminders</strong>
            </div>
        </div>
    );
}

// ─── RevenueCard ───
function RevenueCard({ data, isLoading, isError, mutate }) {
    if (isLoading) return <SkeletonCard height="240px" />;
    if (isError) return <ErrorInline message="Revenue data failed" onRetry={mutate} />;
    const rows = data?.breakdown || [];
    return (
        <div style={{ background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Haspataal recovered</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", color: "#2dd4bf", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{formatINR(data?.totalRecovered)}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.25rem" }}>this {data?.period || "month"} via retention engine</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {rows.map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{r.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0" }}>{formatINR(r.amount)}</span>
                            {r.growthPct !== 0 && <span style={{ fontSize: "0.68rem", fontWeight: "700", color: r.growthPct > 0 ? "#22c55e" : "#ef4444", background: r.growthPct > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>{r.growthPct > 0 ? "+" : ""}{r.growthPct}%</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Dashboard ───
export default function HospitalDashboardClient({ user, initialHospital }) {
    const hId = user.hospitalId;

    const { metrics: m, isLoading: mLoad, isError: mErr, mutate: mRetry } = useMetrics(hId);
    const { kpi, isLoading: rLoad, isError: rErr, mutate: rRetry } = useRetentionKPI(hId);
    const { events, isLoading: eLoad, isError: eErr, mutate: eRetry } = useEvents(hId);
    const { notif, isLoading: nLoad, isError: nErr, mutate: nRetry } = useNotifications(hId);
    const { revenue, isLoading: revLoad, isError: revErr, mutate: revRetry } = useRevenue(hId);

    const metricRows = [
        [
            { label: "Today's Visits", value: m?.todaysVisits?.value ?? "—", icon: "🗓", color: "#14b8a6", sub: "OPD + IPD combined", delta: m?.todaysVisits?.deltaLabel || null },
            { label: "Total Patients", value: m?.totalPatients?.value ?? "—", icon: "👥", color: "#3b82f6", sub: `${m?.totalPatients?.newToday ?? 0} new today`, delta: null },
            { label: "Total Doctors", value: m?.totalDoctors?.value ?? "—", icon: "👨‍⚕️", color: "#8b5cf6", sub: `${m?.totalDoctors?.onDutyToday ?? 0} on duty`, delta: null },
        ],
        [
            { label: "Scheduled", value: m?.scheduled?.value ?? "—", icon: "⏰", color: "#f59e0b", sub: `${m?.scheduled?.pending ?? 0} pending`, delta: null },
            { label: "Bed Occupancy", value: m ? `${m.bedOccupancy?.pct ?? 0}%` : "—", icon: "🛏", color: "#ef4444", sub: m ? `${m.bedOccupancy.occupied}/${m.bedOccupancy.total} beds` : "", delta: null },
            { label: "Completed", value: m?.completed?.value ?? "—", icon: "✅", color: "#22c55e", sub: `${m?.completed?.completionRate ?? 0}% rate`, delta: null },
        ],
    ];

    return (
        <div style={{ padding: "1.75rem", maxWidth: "1300px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');@keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}`}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Hospital Dashboard</h1>
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>Welcome back, <strong style={{ color: "#374151" }}>{user.name}</strong> · {initialHospital?.legalName || initialHospital?.name || "Your Hospital"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href="/hospital/dashboard/billing" style={{ fontSize: "0.82rem", fontWeight: "600", padding: "0.5rem 1rem", borderRadius: "8px", background: "#14b8a6", color: "#fff", textDecoration: "none" }}>+ New OPD Visit</Link>
                    <div style={{ position: "relative" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🔔</div>
                        <span style={{ position: "absolute", top: "-3px", right: "-3px", background: "#ef4444", color: "#fff", fontSize: "0.55rem", fontWeight: "700", borderRadius: "999px", padding: "0.1rem 0.3rem", lineHeight: 1 }}>12</span>
                    </div>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#14b8a6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "700" }}>
                        {(user.name || "H").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Section 1: Metric Cards */}
            {mErr && <ErrorInline message="Metrics failed to load" onRetry={mRetry} />}
            {metricRows.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {mLoad ? [1,2,3].map(i => <MetricSkeleton key={i} />) : row.map(mc => <MetricCard key={mc.label} {...mc} />)}
                </div>
            ))}

            {/* Section 2+3: Retention + EventLog */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                <RetentionCard kpi={kpi} isLoading={rLoad} isError={rErr} mutate={rRetry} />
                <EventLogCard events={events} isLoading={eLoad} isError={eErr} mutate={eRetry} />
            </div>

            {/* Section 4: Follow-Up Queue */}
            <div style={{ marginBottom: "0.75rem" }}><FollowUpQueue hospitalId={hId} /></div>

            {/* Section 5+6: Notifications + Revenue */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <NotificationCard data={notif} isLoading={nLoad} isError={nErr} mutate={nRetry} />
                <RevenueCard data={revenue} isLoading={revLoad} isError={revErr} mutate={revRetry} />
            </div>

            {/* Quick Links */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {[{ href: "/hospital/dashboard/reports", label: "📊 Reports" }, { href: "/hospital/dashboard/doctors", label: "👨‍⚕️ Doctors" }, { href: "/hospital/dashboard/analytics", label: "📈 Analytics" }].map(l => (
                    <Link key={l.href} href={l.href} style={{ fontSize: "0.8rem", fontWeight: "600", padding: "0.45rem 0.9rem", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", textDecoration: "none" }}>{l.label}</Link>
                ))}
            </div>
        </div>
    );
}
