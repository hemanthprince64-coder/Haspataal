"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: "🏠" },
        { name: "Search", href: "/search", icon: "🔍" },
        { name: "MedChat", href: "/medchat", icon: "🤖" },
        { name: "Records", href: "/records", icon: "📋" },
        { name: "Profile", href: "/profile", icon: "👤" },
    ];

    return (
        <nav className="sticky bottom-0 bg-white border-t border-slate-200 w-full z-[100] pt-2 pb-1.5 flex justify-around shadow-[0_-1px_3px_rgba(15,23,42,0.04)]">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col items-center gap-0.5 font-sans text-[11px] font-medium no-underline transition-colors duration-200 py-1 px-3 rounded-lg ${isActive
                            ? "text-medical-600"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        <span className={`text-xl transition-transform duration-200 ${isActive ? "scale-110" : "scale-100 grayscale opacity-60"}`}>
                            {item.icon}
                        </span>
                        <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
