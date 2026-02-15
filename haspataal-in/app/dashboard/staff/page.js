import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createStaff } from "@/app/actions/staff";

export default async function StaffPage() {
    const session = await auth();
    if (!session || session.user.role !== 'HOSPITAL_ADMIN') redirect('/login');

    const hospitalId = session.user.hospitalId;

    const staffList = await prisma.staff.findMany({
        where: { hospitalId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "2rem" }}>Manage Staff</h1>

            <div className="grid-layout">
                {/* Create Staff Form */}
                <div className="card">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Add New Staff</h2>
                    <form action={createStaff}>
                        <input type="hidden" name="hospitalId" value={hospitalId} />

                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input name="name" required className="form-input" placeholder="Staff Name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile</label>
                            <input name="mobile" required className="form-input" placeholder="10-digit Mobile" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-input">
                                <option value="STAFF">Staff (Receptionist)</option>
                                <option value="NURSE">Nurse</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                            Create Staff Account
                        </button>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                            Default password will be the mobile number.
                        </p>
                    </form>
                </div>

                {/* Staff List */}
                <div className="card">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Existing Staff</h2>
                    {staffList.length === 0 ? (
                        <p className="text-muted">No staff members found.</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.mobile}</td>
                                        <td><span className="badge badge-primary">{s.role}</span></td>
                                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
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
