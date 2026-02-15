import Link from "next/link";
import Image from "next/image";

export default function HospitalLanding() {
    return (
        <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <div className="animate-fade-in-up" style={{ marginBottom: "1.5rem" }}>
                <div style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                }}>
                    <Image src="/logo.svg" alt="Haspataal" width={60} height={60} style={{ objectFit: "contain" }} />
                </div>
                <h1 style={{ fontSize: "2.25rem", fontWeight: "800", marginBottom: "0.75rem" }}>Hospital Partner Portal</h1>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
                    Join Haspataal's network. Digitize your OPD, manage patients, and grow your practice.
                </p>
            </div>

            <div className="animate-fade-in-up delay-1" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: "180px" }}>
                    ⬆️ Login
                </Link>
                <Link href="/register" className="btn btn-outline btn-lg" style={{ minWidth: "180px" }}>
                    ✨ Register Hospital
                </Link>
            </div>

            <div className="animate-fade-in-up delay-2" style={{ marginTop: "4rem" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1.5rem"
                }}>
                    {[
                        { icon: "📋", title: "OPD Management", desc: "Digitize walk-in and appointment-based OPD visits" },
                        { icon: "👨‍⚕️", title: "Doctor Management", desc: "Add and manage your doctors and their schedules" },
                        { icon: "📊", title: "Reports & Analytics", desc: "Track daily visits, revenue, and patient metrics" },
                    ].map(f => (
                        <div key={f.title} className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.5rem" }}>{f.title}</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.6" }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
