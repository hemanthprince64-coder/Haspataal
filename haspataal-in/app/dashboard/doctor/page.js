import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { updateAppointmentStatus } from "@/app/actions";

export default async function DoctorDashboard() {
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') redirect('/login/doctor');

    const doctorId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
        where: { doctorId },
        include: { patient: true },
        orderBy: { date: 'asc' }
    });

    const isToday = (date) => {
        const d = new Date(date);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const todaysAppointments = appointments.filter(a => isToday(a.date));
    const upcomingAppointments = appointments.filter(a => new Date(a.date) > today && !isToday(a.date));

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "1.5rem" }}>Doctor Dashboard</h1>

            <div className="grid-layout">
                {/* Stats / Welcome Card */}
                <div className="card" style={{ background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "white" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>👋 Welcome, Dr. {session.user.name}</h2>
                    <p style={{ opacity: 0.9 }}>You have <strong style={{ color: '#38bdf8' }}>{todaysAppointments.length}</strong> appointments today.</p>
                </div>

                {/* Today's Schedule */}
                <div className="card">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📅 Today's Schedule
                    </h2>

                    {todaysAppointments.length === 0 ? (
                        <p className="text-muted">No appointments scheduled for today.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {todaysAppointments.map(app => (
                                <div key={app.id} style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: app.status === 'COMPLETED' ? '#f0fdf4' : 'white'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{app.patient?.name || 'Unknown Patient'}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            🕒 {app.slot} • 📱 {app.patient?.phone}
                                        </div>
                                        {app.notes && <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Memo: {app.notes}</div>}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/dashboard/doctor/record/${app.patientId}`} className="btn btn-sm btn-outline">
                                            📝 Record
                                        </Link>
                                        {app.status === 'PENDING' && (
                                            <>
                                                <form action={updateAppointmentStatus}>
                                                    <input type="hidden" name="appointmentId" value={app.id} />
                                                    <input type="hidden" name="status" value="COMPLETED" />
                                                    <button className="btn btn-sm btn-primary">✅ Complete</button>
                                                </form>
                                                <form action={updateAppointmentStatus}>
                                                    <input type="hidden" name="appointmentId" value={app.id} />
                                                    <input type="hidden" name="status" value="CANCELLED" />
                                                    <button className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>❌ Cancel</button>
                                                </form>
                                            </>
                                        )}
                                        {app.status !== 'PENDING' && (
                                            <span className={`badge ${app.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                                                {app.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Appointments */}
                <div className="card">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>🔜 Upcoming</h2>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-muted">No upcoming appointments.</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Patient</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingAppointments.map(app => (
                                    <tr key={app.id}>
                                        <td>{new Date(app.date).toLocaleDateString()}</td>
                                        <td>{app.slot}</td>
                                        <td>{app.patient?.name}</td>
                                        <td><span className="badge badge-primary">{app.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
