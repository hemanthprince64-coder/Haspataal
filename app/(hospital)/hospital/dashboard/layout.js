import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutHospital } from "@/app/actions";
import { requireRole } from "../../../../lib/auth/requireRole";
import { UserRole } from "../../../../types";

export default async function DashboardLayout({ children }) {
    let user;
    try {
        user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");
    } catch (e) {
        redirect("/hospital/login");
    }

    const navItems = [
        { href: "/hospital/dashboard", label: "Overview", icon: "◈", badge: null },
        { href: "/hospital/dashboard/billing", label: "OPD & Billing", icon: "⊕", badge: null },
        { href: "/hospital/dashboard/retention", label: "Retention", icon: "♻", badge: "3" },
        { href: "/hospital/dashboard/wards", label: "IPD / Wards", icon: "⊞", badge: null },
        { href: "/hospital/dashboard/pharmacy", label: "Pharmacy", icon: "⊠", badge: null },
        { href: "/hospital/dashboard/diagnostics", label: "Diagnostics", icon: "⊗", badge: null },
        { href: "/hospital/dashboard/analytics", label: "Analytics", icon: "◉", badge: null },
        { href: "/hospital/dashboard/notifications", label: "Notifications", icon: "◎", badge: "12" },
        { href: "/hospital/dashboard/reports", label: "Reports", icon: "◫", badge: null },
        { href: "/hospital/dashboard/setup", label: "Setup Wizard", icon: "◑", badge: null },
    ];

    const initials = (user.name || "H").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                .dash-nav-link { display:flex; align-items:center; gap:0.65rem; padding:0.6rem 1rem; border-radius:8px; color:#94a3b8; text-decoration:none; font-size:0.875rem; font-weight:500; transition:all 0.15s; position:relative; }
                .dash-nav-link:hover { background:rgba(20,184,166,0.08); color:#5eead4; }
                .dash-nav-link.active { background:rgba(20,184,166,0.12); color:#2dd4bf; border-left:3px solid #14b8a6; padding-left:calc(1rem - 3px); }
                .dash-nav-badge { font-size:0.65rem; font-weight:700; background:#14b8a6; color:#fff; border-radius:999px; padding:0.1rem 0.4rem; margin-left:auto; }
                .logout-btn { width:100%; padding:0.65rem 1rem; border-radius:8px; background:rgba(239,68,68,0.08); color:#f87171; border:none; cursor:pointer; font-size:0.85rem; font-weight:500; text-align:left; display:flex; align-items:center; gap:0.65rem; transition:background 0.15s; }
                .logout-btn:hover { background:rgba(239,68,68,0.15); }
                .setup-bar-fill { height:6px; background:linear-gradient(90deg,#14b8a6,#06b6d4); border-radius:999px; width:87%; transition:width 0.5s; }
            `}</style>

            {/* Sidebar */}
            <aside style={{ width: "240px", background: "#0f172a", color: "white", display: "flex", flexDirection: "column", padding: "1.25rem 0.75rem", flexShrink: 0, borderRight: "1px solid #1e293b" }}>

                {/* Hospital Badge */}
                <div style={{ padding: "0 0.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg,#14b8a6,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🏥</div>
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: "700", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: "500", letterSpacing: "0.05em" }}>HOSPITAL_ADMIN</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px", overflowY: "auto" }}>
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className="dash-nav-link">
                            <span style={{ fontSize: "1rem", opacity: 0.7 }}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge && <span className="dash-nav-badge">{item.badge}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Setup Progress */}
                <div style={{ margin: "1rem 0.5rem", padding: "0.75rem", background: "rgba(20,184,166,0.08)", borderRadius: "10px", border: "1px solid rgba(20,184,166,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: "600", color: "#2dd4bf", marginBottom: "0.5rem" }}>
                        <span>Setup Complete</span><span>87%</span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px" }}>
                        <div className="setup-bar-fill" />
                    </div>
                </div>

                {/* Logout */}
                <div style={{ borderTop: "1px solid #1e293b", paddingTop: "0.75rem" }}>
                    <form action={logoutHospital}>
                        <button type="submit" className="logout-btn">
                            <span>🚪</span> Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, background: "#f8fafc", overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}
