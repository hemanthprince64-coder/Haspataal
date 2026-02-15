import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardLayout({ children }) {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("session_admin");

    if (!adminCookie) {
        redirect("/");
    }

    const admin = JSON.parse(adminCookie.value);

    return (
        <div className="container" style={{ padding: "2rem 1rem", maxWidth: "1200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <span className="badge badge-error">ADMIN PANEL</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Logged in as: <strong>{admin.name}</strong>
                    </span>
                    <form action={async () => {
                        'use server';
                        (await cookies()).delete('session_admin');
                        redirect('/');
                    }}>
                        <button type="submit" className="btn btn-outline btn-sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
            {children}
        </div>
    );
}
