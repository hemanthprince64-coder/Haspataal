import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bot, Activity, FileText, User } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Search", href: "/search", icon: Search },
        { name: "MedChat", href: "/medchat", icon: Bot },
        { name: "Recovery", href: "/recovery", icon: Activity },
        { name: "Records", href: "/records", icon: FileText },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full h-[72px] bg-white border-t border-slate-200 flex justify-between items-center px-1 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] z-[9999] md:px-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col items-center justify-center flex-1 min-w-[60px] gap-1 transition-all duration-300 py-1 rounded-xl ${isActive
                            ? "text-blue-600 bg-blue-50/80 scale-105"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        <Icon 
                            className={`w-6 h-6 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100 opacity-70"}`} 
                        />
                        <span className={`text-[10px] ${isActive ? "font-black tracking-tight" : "font-bold opacity-80"}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
