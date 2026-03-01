"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import styles from "./layout.module.css";

export default function PatientLayout({ children }) {
    const pathname = usePathname() || "";
    const isAuthPage = pathname === "/login" || pathname === "/register";

    const navLinks = [
        { name: "Home", href: "/home", icon: "🏠" },
        { name: "Find Doctors", href: "/search", icon: "🔍" },
        { name: "Hospitals", href: "/hospitals", icon: "🏥" },
        { name: "Lab Tests", href: "/lab-tests", icon: "🔬" },

        { name: "My Records", href: "/records", icon: "📋" },
        { name: "Emergency", href: "/emergency", icon: "🚑" },
    ];

    return (
        <div className={styles.appShell}>
            {/* Desktop: Top Navigation Bar */}
            <header className={styles.desktopNav}>
                <div className={styles.navInner}>
                    <Link href="/home" className={styles.logo}>
                        <img src="/logo.svg" alt="Haspataal" className={styles.logoImg} />
                        <span className={styles.logoText}>Haspataal</span>
                        <span className={styles.logoDot}>.</span>
                    </Link>
                    <nav className={styles.navLinks}>
                        {navLinks.slice(0, 5).map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${styles.navLink} ${pathname.startsWith(link.href) ? styles.navLinkActive : ""}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                    <div className={styles.navActions}>
                        <Link href="/emergency" className={styles.emergencyBtn}>🚑 Emergency</Link>
                        {!isAuthPage && (
                            <Link href="/profile" className={styles.profileBtn}>
                                <span className={styles.profileAvatar}>R</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Desktop: Sidebar + Content | Mobile: Full Content + BottomNav */}
            <div className={styles.mainArea}>
                {!isAuthPage && (
                    <aside className={styles.sidebar}>
                        <nav className={styles.sidebarNav}>
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`${styles.sidebarLink} ${pathname.startsWith(link.href) ? styles.sidebarLinkActive : ""}`}
                                >
                                    <span className={styles.sidebarIcon}>{link.icon}</span>
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className={styles.sidebarFooter}>
                            <Link href="/tracker" className={styles.sidebarLink}>
                                <span className={styles.sidebarIcon}>🤰</span>
                                <span>Pregnancy Tracker</span>
                            </Link>
                            <Link href="/profile" className={styles.sidebarLink}>
                                <span className={styles.sidebarIcon}>👤</span>
                                <span>My Profile</span>
                            </Link>
                        </div>
                    </aside>
                )}

                <main className={styles.content}>
                    {children}
                </main>
            </div>

            {/* Mobile: Bottom Navigation */}
            {!isAuthPage && (
                <div className={styles.mobileOnly}>
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
