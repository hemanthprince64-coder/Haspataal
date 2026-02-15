import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logoutAdmin } from "@/app/actions";

export default async function AdminDashboardLayout({ children }) {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("session_admin");

    if (!adminCookie) redirect("/admin");
    const admin = JSON.parse(adminCookie.value);

    const navItems = [
        { href: "/admin/dashboard", label: "Overview", icon: "📊" },
        { href: "/admin/dashboard/hospitals", label: "Hospitals", icon: "🏥" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside style={{
                width: "260px",
                background: "linear-gradient(180deg, #0f172a 0%, #1e1e2e 100%)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 0",
                flexShrink: 0,
            }}>
                <div style={{ padding: "0 1.25rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <Image src="/logo.svg" alt="Haspataal" width={36} height={36} style={{ objectFit: "contain" }} />
                        <div>
                            <div style={{ fontWeight: "700", fontSize: "1rem" }}>Haspataal</div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Panel</div>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 0.75rem" }}>
                    {navItems.map(item => (
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
                            }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "0 1rem", borderTop: "1px solid #334155", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.75rem", padding: "0 0.25rem" }}>
                        🛡️ {admin.name}
                    </div>
                    <form action={logoutAdmin}>
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
                            }}
                        >
                            🚪 Logout
                        </button>
                    </form>
                </div>
            </aside>

            <main style={{ flex: 1, padding: "2rem", background: "#f8fafc", overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}
