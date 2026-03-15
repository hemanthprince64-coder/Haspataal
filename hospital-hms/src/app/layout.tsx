import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Haspataal — Hospital Management System',
    description: 'Your hospital operations hub on hospital.haspataal.com',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-white min-h-screen flex`}>
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shrink-0">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-emerald-400">Haspataal</h1>
                        <p className="text-xs text-slate-500 mt-1">hospital.haspataal.com</p>
                    </div>
                    <nav className="flex flex-col gap-2 flex-1">
                        <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium text-sm">
                            <span>🏥</span> HMS Overview
                        </a>
                        <a href="/doctors" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>👨‍⚕️</span> Doctors
                        </a>
                        <a href="/opd" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>📋</span> OPD Management
                        </a>
                        <a href="/ipd" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>🛏️</span> IPD / Wards
                        </a>
                        <a href="/billing" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>💰</span> Billing
                        </a>
                        <a href="/diagnostics" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>🧪</span> Diagnostics
                        </a>
                        <a href="/analytics" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-colors">
                            <span>📊</span> Analytics
                        </a>
                    </nav>
                    <div className="mt-auto">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold">H</div>
                            <div>
                                <p className="text-xs font-semibold">Hospital Admin</p>
                                <p className="text-[10px] text-slate-500">hospital.haspataal.com</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
