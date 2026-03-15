import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Haspataal — Admin Control Panel',
    description: 'Platform management and hospital onboarding hub.',
};

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-white min-h-screen flex`}>
                {/* Admin Sidebar */}
                <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col p-6 shrink-0">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-violet-400">Haspataal</h1>
                        <p className="text-xs text-gray-500 mt-1">admin.haspataal.com</p>
                    </div>
                    <nav className="flex flex-col gap-2 flex-1">
                        <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-violet-500/10 text-violet-400 font-medium text-sm">
                            <span>🛡️</span> Admin Dashboard
                        </a>
                        <a href="/hospitals" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>🏥</span> Hospital Onboarding
                        </a>
                        <a href="/doctors" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>👨‍⚕️</span> Doctor Verification
                        </a>
                        <a href="/commissions" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>💰</span> Commissions
                        </a>
                        <a href="/analytics" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>📊</span> Platform Analytics
                        </a>
                        <a href="/users" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>👥</span> User Management
                        </a>
                        <a href="/audit" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                            <span>📋</span> Audit Logs
                        </a>
                    </nav>
                    <div className="mt-auto">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-600 flex items-center justify-center text-xs font-bold">A</div>
                            <div>
                                <p className="text-xs font-semibold">Super Admin</p>
                                <p className="text-[10px] text-gray-500">admin.haspataal.com</p>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </body>
        </html>
    );
}
