"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/home", icon: "🏠" },
        { name: "Search", href: "/search", icon: "🔍" },
        { name: "Bookings", href: "/bookings", icon: "📅" },
        { name: "Records", href: "/records", icon: "📋" },
        { name: "Profile", href: "/profile", icon: "👤" },
    ];

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link key={item.name} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}
