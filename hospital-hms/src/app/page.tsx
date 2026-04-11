import Link from 'next/link';

export default function HospitalDashboard() {
    const stats = [
        { label: "Today's OPD Patients", value: '87', icon: '🏥', color: 'from-emerald-500 to-teal-600' },
        { label: 'Active IPD Beds', value: '34 / 120', icon: '🛏️', color: 'from-blue-500 to-cyan-600' },
        { label: 'Revenue Today', value: '₹1.2L', icon: '💰', color: 'from-yellow-500 to-orange-600' },
        { label: 'Doctors On-Duty', value: '12', icon: '👨‍⚕️', color: 'from-violet-500 to-purple-600' },
    ];

    const recentPatients = [
        { id: 'HPT-001', name: 'Arun Kumar', ward: 'General', admitted: '15 Mar 2026', status: 'Admitted' },
        { id: 'HPT-002', name: 'Priya Singh', ward: 'Maternity', admitted: '14 Mar 2026', status: 'Recovering' },
        { id: 'HPT-003', name: 'Suresh Babu', ward: 'Cardiology', admitted: '14 Mar 2026', status: 'Critical' },
        { id: 'HPT-004', name: 'Lakshmi Devi', ward: 'Orthopedics', admitted: '13 Mar 2026', status: 'Recovering' },
        { id: 'HPT-005', name: 'Rahul Mehta', ward: 'General', admitted: '16 Mar 2026', status: 'Admitted' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Hospital Management System 🏥</h2>
                <p className="text-slate-400 mt-1 text-sm">Multi-tenant view — data isolated by hospital_id.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Patients Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Recent IPD Patients</h3>
                    <Link href="/ipd" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Manage Wards →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-500 text-xs border-b border-slate-800">
                                <th className="text-left pb-3">Patient ID</th>
                                <th className="text-left pb-3">Name</th>
                                <th className="text-left pb-3">Ward</th>
                                <th className="text-left pb-3">Admitted</th>
                                <th className="text-left pb-3">Status</th>
                                <th className="text-left pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {recentPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 text-slate-500 font-mono text-xs">{patient.id}</td>
                                    <td className="py-3 text-white font-medium">{patient.name}</td>
                                    <td className="py-3 text-slate-400">{patient.ward}</td>
                                    <td className="py-3 text-slate-400">{patient.admitted}</td>
                                    <td className="py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${patient.status === 'Admitted' ? 'bg-blue-500/20 text-blue-400' :
                                                patient.status === 'Recovering' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                            View Record →
                                        </button>
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
