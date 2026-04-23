"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Mock enrichment data (real data wired via stats fetch) ───────────────────
const MOCK_EVENTS = [
    { id: 1, ts: "01:14:03", type: "patient_discharged", label: "Sunita Devi — Ward 3", color: "#f59e0b" },
    { id: 2, ts: "01:09:47", type: "followup_created",   label: "7-day OPD check-in scheduled", color: "#14b8a6" },
    { id: 3, ts: "00:58:22", type: "bill_paid",           label: "₹4,200 — Rahul Sharma", color: "#22c55e" },
    { id: 4, ts: "00:44:11", type: "notification_sent",  label: "WhatsApp → Priya Kumari", color: "#818cf8" },
    { id: 5, ts: "00:31:05", type: "patient_admitted",   label: "ICU Bed 4 — Anand Kumar", color: "#ef4444" },
    { id: 6, ts: "00:17:49", type: "doctor_prescribes",  label: "Dr. Mehta — 3 medicines", color: "#0ea5e9" },
];

const MOCK_FOLLOWUPS = [
    { id: 1, initials: "SK", name: "Suman Kumari",  pathway: "Pregnancy",  doctor: "Dr. Anjali",  due: "Today",    urgency: "urgent" },
    { id: 2, initials: "RP", name: "Ravi Prasad",   pathway: "Chronic",    doctor: "Dr. Mehta",   due: "Today",    urgency: "urgent" },
    { id: 3, initials: "PD", name: "Priya Devi",    pathway: "Pediatric",  doctor: "Dr. Kumar",   due: "Tomorrow", urgency: "soon" },
    { id: 4, initials: "AK", name: "Anil Kumar",    pathway: "OPD General",doctor: "Dr. Singh",   due: "26 Apr",   urgency: "ok" },
    { id: 5, initials: "MK", name: "Meena Khatoon", pathway: "Chronic",    doctor: "Dr. Mehta",   due: "MISSED",   urgency: "missed" },
];

const PATHWAY_COLORS = { Pregnancy: "#a855f7", Pediatric: "#14b8a6", Chronic: "#f59e0b", "OPD General": "#3b82f6" };
const URGENCY_DOT = { urgent: "#ef4444", soon: "#f59e0b", ok: "#22c55e", missed: "#94a3b8" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color, icon, delta }) {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", borderLeft: `3px solid ${color}`, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                <span style={{ fontSize: "1.25rem" }}>{icon}</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>{value}</div>
            {delta && <div style={{ fontSize: "0.72rem", color: color, fontWeight: "600" }}>{delta}</div>}
            {sub && <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{sub}</div>}
        </div>
    );
}

function RetentionCard() {
    const pct = 71;
    const r = 44, circ = 2 * Math.PI * r;
    const pathways = [
        { label: "Pregnancy", val: 83, color: "#a855f7" },
        { label: "Pediatrics", val: 91, color: "#14b8a6" },
        { label: "Chronic", val: 67, color: "#f59e0b" },
        { label: "OPD General", val: 54, color: "#3b82f6" },
    ];
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Retention Engine</span>
                <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#d97706", padding: "0.1rem 0.5rem", borderRadius: "999px", fontWeight: "600" }}>★ The Moat</span>
            </div>

            {/* Ring */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#14b8a6" strokeWidth="10"
                        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                        strokeLinecap="round" transform="rotate(-90 50 50)" />
                    <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">{pct}%</text>
                </svg>
                <div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: "0.35rem" }}>Discharged → Follow-up (30d)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#14b8a6" }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: "600" }}>pH Hospitals 71%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#e5e7eb" }} />
                            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Network avg 63%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pathways */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {pathways.map(p => (
                    <div key={p.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "#374151", fontWeight: "500" }}>{p.label}</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: p.color }}>{p.val}%</span>
                        </div>
                        <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "999px" }}>
                            <div style={{ height: "5px", width: `${p.val}%`, background: p.color, borderRadius: "999px" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EventLogCard() {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem", height: "100%" }}>
            <style>{`
                @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
                .pulse-dot { width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse-dot 1.5s ease-in-out infinite; }
            `}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div className="pulse-dot" />
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Live EventLog</span>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#9ca3af" }}>Stream</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {MOCK_EVENTS.map(ev => (
                    <div key={ev.id} style={{ display: "flex", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid #f8fafc", alignItems: "flex-start", borderLeft: `2px solid ${ev.color}`, paddingLeft: "0.75rem", marginLeft: "-1.25rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#9ca3af", whiteSpace: "nowrap", paddingTop: "0.1rem" }}>{ev.ts}</span>
                        <div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: "600", color: ev.color }}>{ev.type}</div>
                            <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{ev.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FollowUpQueue() {
    const [tab, setTab] = useState("due");
    const due = MOCK_FOLLOWUPS.filter(f => f.urgency !== "missed");
    const missed = MOCK_FOLLOWUPS.filter(f => f.urgency === "missed");
    const rows = tab === "due" ? due : missed;

    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>Pending Follow-ups</span>
                <span style={{ fontSize: "0.68rem", background: "#fef2f2", color: "#dc2626", fontWeight: "700", padding: "0.1rem 0.5rem", borderRadius: "999px" }}>2 urgent</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
                    {[["due", "Due Soon"], ["missed", "Missed (1)"]].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)} style={{ fontSize: "0.72rem", fontWeight: "600", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid", borderColor: tab === k ? "#14b8a6" : "#e5e7eb", background: tab === k ? "#f0fdfa" : "transparent", color: tab === k ? "#0d9488" : "#6b7280", cursor: "pointer" }}>{l}</button>
                    ))}
                </div>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {["", "Patient", "Pathway / Doctor", "Due", ""].map((h, i) => (
                                <th key={i} style={{ textAlign: "left", padding: "0.4rem 0.5rem", fontWeight: "600", color: "#9ca3af", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(f => (
                            <tr key={f.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                <td style={{ padding: "0.55rem 0.5rem" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: URGENCY_DOT[f.urgency] }} />
                                </td>
                                <td style={{ padding: "0.55rem 0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "700", color: "#475569", flexShrink: 0 }}>{f.initials}</div>
                                        <span style={{ fontWeight: "600", color: "#0f172a" }}>{f.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "0.55rem 0.5rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                        <span style={{ fontSize: "0.68rem", background: PATHWAY_COLORS[f.pathway] + "18", color: PATHWAY_COLORS[f.pathway], fontWeight: "700", padding: "0.1rem 0.4rem", borderRadius: "4px", display: "inline-block", width: "fit-content" }}>{f.pathway}</span>
                                        <span style={{ color: "#9ca3af", fontSize: "0.68rem" }}>{f.doctor}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "0.55rem 0.5rem", color: f.urgency === "urgent" ? "#dc2626" : f.urgency === "missed" ? "#9ca3af" : "#374151", fontWeight: f.urgency === "urgent" ? "700" : "500", fontSize: "0.8rem" }}>{f.due}</td>
                                <td style={{ padding: "0.55rem 0.5rem" }}>
                                    <button style={{ fontSize: "0.68rem", fontWeight: "600", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid #14b8a6", background: "transparent", color: "#0d9488", cursor: "pointer", whiteSpace: "nowrap" }}>Send reminder</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function NotificationCard() {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.75rem" }}>Today's Sends</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                {[
                    { ch: "WhatsApp", icon: "💬", sent: 47, delivered: 43, color: "#22c55e" },
                    { ch: "SMS Fallback", icon: "📱", sent: 11, delivered: 9, color: "#3b82f6" },
                ].map(c => (
                    <div key={c.ch} style={{ padding: "0.75rem", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "1rem" }}>{c.icon}</span>
                            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#374151" }}>{c.ch}</span>
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>{c.sent}</div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>sent · {c.delivered} delivered</div>
                        <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "999px", marginTop: "0.4rem" }}>
                            <div style={{ height: "4px", width: `${Math.round(c.delivered / c.sent * 100)}%`, background: c.color, borderRadius: "999px" }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.6rem 0.75rem", fontSize: "0.75rem", color: "#92400e", fontWeight: "500" }}>
                ⏰ Scheduled for tonight: <strong>14 reminders</strong>
            </div>
        </div>
    );
}

function RevenueCard() {
    const rows = [
        { label: "OPD Follow-up Recovery", amt: "₹89,200", growth: "+34%" },
        { label: "Chronic Pathway", amt: "₹96,400", growth: "+51%" },
        { label: "Vaccination Reminders", amt: "₹45,800", growth: "+22%" },
    ];
    return (
        <div style={{ background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Haspataal recovered</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", color: "#2dd4bf", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>₹2,31,400</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.25rem" }}>this month via retention engine</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {rows.map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{r.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0" }}>{r.amt}</span>
                            <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#22c55e", background: "rgba(34,197,94,0.12)", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>{r.growth}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function HospitalDashboardClient({ user, initialHospital }) {
    const [stats, setStats] = useState({
        todayVisits: 0, totalPatients: 0, totalDoctors: 0,
        scheduledVisits: 0, totalVisits: 0, completedVisits: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("@/app/actions").then(({ getHospitalDashboardData }) => {
            getHospitalDashboardData(user.hospitalId).then(data => {
                if (data?.stats) setStats(data.stats);
                setLoading(false);
            });
        });
    }, [user.hospitalId]);

    const bedPct = 68;
    const compRate = stats.totalVisits > 0 ? Math.round(stats.completedVisits / stats.totalVisits * 100) : 0;

    const metricRows = [
        [
            { label: "Today's Visits",   value: stats.todayVisits,     icon: "🗓", color: "#14b8a6", sub: "OPD + IPD combined", delta: "↑ 3 vs yesterday" },
            { label: "Total Patients",   value: stats.totalPatients,   icon: "👥", color: "#3b82f6", sub: "Registered on platform", delta: null },
            { label: "Total Doctors",    value: stats.totalDoctors,    icon: "👨‍⚕️", color: "#8b5cf6", sub: "Active affiliations", delta: null },
        ],
        [
            { label: "Scheduled",        value: stats.scheduledVisits, icon: "⏰", color: "#f59e0b", sub: "Upcoming appointments", delta: null },
            { label: "Bed Occupancy",    value: `${bedPct}%`,          icon: "🛏", color: "#ef4444", sub: "21 / 30 beds occupied", delta: "↑ 5% vs last week" },
            { label: "Completed",        value: stats.completedVisits, icon: "✅", color: "#22c55e", sub: `${compRate}% completion rate`, delta: null },
        ],
    ];

    return (
        <div style={{ padding: "1.75rem", maxWidth: "1300px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Hospital Dashboard</h1>
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>Welcome back, <strong style={{ color: "#374151" }}>{user.name}</strong> · {initialHospital?.legalName || initialHospital?.name || "Your Hospital"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href="/hospital/dashboard/billing" style={{ fontSize: "0.82rem", fontWeight: "600", padding: "0.5rem 1rem", borderRadius: "8px", background: "#14b8a6", color: "#fff", textDecoration: "none" }}>
                        + New OPD Visit
                    </Link>
                    <div style={{ position: "relative" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🔔</div>
                        <span style={{ position: "absolute", top: "-3px", right: "-3px", background: "#ef4444", color: "#fff", fontSize: "0.55rem", fontWeight: "700", borderRadius: "999px", padding: "0.1rem 0.3rem", lineHeight: 1 }}>12</span>
                    </div>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#14b8a6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "700" }}>
                        {(user.name || "H").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* ── Section 1: Metric Cards ── */}
            {metricRows.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {row.map(m => <MetricCard key={m.label} {...m} />)}
                </div>
            ))}

            {/* ── Section 2+3: Retention + EventLog ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                <RetentionCard />
                <EventLogCard />
            </div>

            {/* ── Section 4: Follow-Up Queue ── */}
            <div style={{ marginBottom: "0.75rem" }}>
                <FollowUpQueue />
            </div>

            {/* ── Section 5+6: Notifications + Revenue ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <NotificationCard />
                <RevenueCard />
            </div>

            {/* Quick Links */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {[
                    { href: "/hospital/dashboard/reports", label: "📊 View Reports" },
                    { href: "/hospital/dashboard/doctors", label: "👨‍⚕️ Manage Doctors" },
                    { href: "/hospital/dashboard/analytics", label: "📈 Analytics" },
                ].map(l => (
                    <Link key={l.href} href={l.href} style={{ fontSize: "0.8rem", fontWeight: "600", padding: "0.45rem 0.9rem", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", textDecoration: "none" }}>
                        {l.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
