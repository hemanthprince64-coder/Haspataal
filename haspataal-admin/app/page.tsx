import Link from 'next/link';

export default function AdminDashboard() {
    const stats = [
        { label: 'Total Hospitals', value: '42', icon: '🏥', color: 'from-violet-500 to-purple-700' },
        { label: 'Active Doctors', value: '893', icon: '👨‍⚕️', color: 'from-blue-500 to-cyan-600' },
        { label: 'Patients (MTD)', value: '14.2K', icon: '👥', color: 'from-emerald-500 to-teal-600' },
        { label: 'Platform Revenue', value: '₹18.4L', icon: '💰', color: 'from-yellow-500 to-orange-600' },
    ];

    const pendingHospitals = [
        { name: 'Sunrise Medical Centre', city: 'Hyderabad', submitted: '15 Mar 2026', status: 'Pending Review' },
        { name: 'Apollo Life Care', city: 'Bangalore', submitted: '14 Mar 2026', status: 'Documents Needed' },
        { name: 'Medicity Hospital', city: 'Pune', submitted: '13 Mar 2026', status: 'Under Verification' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Admin Control Panel 🛡️</h2>
                <p className="text-gray-400 mt-1 text-sm">Super Admin view — full platform access.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Pending Hospital Approvals */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Pending Hospital Approvals</h3>
                    <Link href="/hospitals" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Manage All →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs border-b border-gray-800">
                                <th className="text-left pb-3">Hospital</th>
                                <th className="text-left pb-3">City</th>
                                <th className="text-left pb-3">Submitted</th>
                                <th className="text-left pb-3">Status</th>
                                <th className="text-left pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {pendingHospitals.map((h) => (
                                <tr key={h.name} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 text-white font-medium">{h.name}</td>
                                    <td className="py-3 text-gray-400">{h.city}</td>
                                    <td className="py-3 text-gray-400">{h.submitted}</td>
                                    <td className="py-3">
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-500/20 text-yellow-400">{h.status}</span>
                                    </td>
                                    <td className="py-3 flex gap-2">
                                        <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Approve</button>
                                        <button className="text-xs text-red-400 hover:text-red-300 font-medium">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
