import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutHospital } from "@/app/actions";
import Image from "next/image";

export default async function DashboardLayout({ children }) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_user");

    if (!userCookie) redirect("/hospital/login");
    const user = JSON.parse(userCookie.value);

    const navItems = [
        { href: "/hospital/dashboard", label: "Overview", icon: "📊" },
        { href: "/hospital/dashboard/billing", label: "OPD & Billing", icon: "💳" },
        { href: "/hospital/dashboard/reports", label: "Reports", icon: "📈" },
        { href: "/hospital/dashboard/doctors", label: "Manage Doctors", icon: "👨‍⚕️", adminOnly: true },
    ];

    const visibleItems = navItems.filter(item => !item.adminOnly || user.role === 'ADMIN');

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
            {/* Sidebar */}
            <aside style={{
                width: "260px",
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 0",
                flexShrink: 0,
            }}>
                {/* Hospital Info */}
                <div style={{ padding: "0 1.25rem", marginBottom: "2rem" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.75rem"
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.25rem",
                            flexShrink: 0,
                        }}>
                            🏥
                        </div>
                        <div>
                            <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{user.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{user.role}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 0.75rem" }}>
                    {visibleItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius)",
                                color: "#e2e8f0",
                                textDecoration: "none",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                transition: "background 0.15s",
                            }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ padding: "0 1rem", borderTop: "1px solid #334155", paddingTop: "1rem", marginTop: "1rem" }}>
                    <form action={logoutHospital}>
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius)",
                                background: "rgba(239,68,68,0.1)",
                                color: "#fca5a5",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                            }}
                        >
                            🚪 Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: "2rem",
                background: "#f8fafc",
                overflowY: "auto",
            }}>
                {children}
            </main>
        </div>
    );
}
