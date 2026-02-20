import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { CSPostHogProvider } from "./providers";
import PostHogPageView from "./PostHogPageView";

export const metadata = {
    title: "Haspataal — Hospital Partner Portal",
    description: "Hospital, lab, and diagnostic center management portal. Join Haspataal's network, manage your OPD, doctors, and grow your practice.",
    keywords: "hospital management, partner portal, Haspataal, OPD, doctor management",
    icons: {
        icon: "/logo.svg",
    },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <CSPostHogProvider>
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
                            <Link href="/" style={{
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
                                <a href="https://haspataal.com" style={{ color: "var(--text-muted)", textDecoration: "none" }}>← Patient Portal</a>
                                <Link href="/" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Hospital Home</Link>
                            </nav>
                        </header>

                        {/* Content */}
                        <PostHogPageView />
                        <div style={{ flex: 1 }}>
                            {children}
                        </div>
                    </div>
                </CSPostHogProvider>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-XXXXXXXXXX');
                    `}
                </Script>
            </body>
        </html>
    );
}
