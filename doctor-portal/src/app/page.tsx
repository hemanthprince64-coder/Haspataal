import Link from 'next/link';

export default function DoctorDashboard() {
  const stats = [
    { label: "Today's Appointments", value: '12', icon: '📅', color: 'from-cyan-500 to-blue-600' },
    { label: 'Active Patients', value: '248', icon: '👥', color: 'from-violet-500 to-purple-600' },
    { label: 'Pending Prescriptions', value: '5', icon: '💊', color: 'from-orange-500 to-red-600' },
    { label: 'Consultations Today', value: '8', icon: '✅', color: 'from-emerald-500 to-teal-600' },
  ];

  const appointments = [
    { time: '09:00 AM', patient: 'Riya Sharma', reason: 'Fever & Cold', status: 'Confirmed' },
    { time: '10:30 AM', patient: 'Arjun Patel', reason: 'Follow-up', status: 'Confirmed' },
    { time: '11:15 AM', patient: 'Meena Iyer', reason: 'BP Check', status: 'Pending' },
    { time: '02:00 PM', patient: 'Rohan Verma', reason: 'Diabetes Review', status: 'Confirmed' },
    { time: '03:30 PM', patient: 'Sunita Rao', reason: 'Skin Allergy', status: 'Telemedicine' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Good morning, Dr. 👋</h2>
        <p className="text-gray-400 mt-1 text-sm">Here&apos;s what&apos;s happening in your practice today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">Today&apos;s Schedule</h3>
          <Link href="/appointments" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left pb-3">Time</th>
                <th className="text-left pb-3">Patient</th>
                <th className="text-left pb-3">Reason</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {appointments.map((appt) => (
                <tr key={appt.time} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-gray-300 font-mono">{appt.time}</td>
                  <td className="py-3 text-white font-medium">{appt.patient}</td>
                  <td className="py-3 text-gray-400">{appt.reason}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${appt.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                        appt.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                      }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                      Open →
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
