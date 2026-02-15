import Image from "next/image";
import Link from "next/link";

export default function HospitalLayout({ children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Header */}
            <header style={{
                height: "60px",
                borderBottom: "1px solid var(--border)",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 1.5rem",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}>
                <Link href="/hospital" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none"
                }}>
                    <Image src="/logo.svg" alt="Haspataal" width={36} height={36} style={{ objectFit: "contain" }} />
                    <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "1.1rem" }}>Haspataal</span>
                    <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        background: "#f1f5f9",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "99px",
                    }}>
                        PARTNER
                    </span>
                </Link>

                <nav style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.85rem" }}>
                    <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>← Patient Portal</Link>
                    <Link href="/hospital" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Hospital Home</Link>
                </nav>
            </header>

            {/* Content */}
            <div style={{ flex: 1 }}>
                {children}
            </div>
        </div>
    );
}
