import Image from "next/image";
import Link from "next/link";
import { Building2, Home, ArrowLeft } from "lucide-react";

export default function HospitalLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50/30">
            {/* Modern Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
                <Link href="/hospital" className="flex items-center gap-3 no-underline group">
                    <div className="relative flex items-center justify-center">
                        <Image 
                            src="/logo.svg" 
                            alt="Haspataal" 
                            width={32} 
                            height={32} 
                            className="object-contain group-hover:scale-105 transition-transform duration-200" 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-lg tracking-tight">Haspataal</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tracking-widest uppercase border border-slate-200/60">
                            Partner
                        </span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-[13px]">
                    <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Patient Portal
                    </Link>
                    <div className="w-px h-4 bg-slate-200" />
                    <Link href="/hospital" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        Hospital Home
                    </Link>
                </nav>
                
                {/* Mobile placeholder - can be expanded later */}
                <div className="md:hidden flex items-center">
                    <Link href="/hospital" className="text-blue-600 font-bold text-sm">Dashboard</Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

