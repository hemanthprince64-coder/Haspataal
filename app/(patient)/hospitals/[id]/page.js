import { services } from "@/lib/services";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function HospitalDetailPage({ params }) {
    const { id } = await params;
    const hospital = services.platform.getHospitalById(id);

    if (!hospital) {
        notFound();
    }

    const doctors = services.platform.getHospitalDoctors(hospital.id);
    const reviews = services.platform.getHospitalReviews(hospital.id);
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : hospital.rating;

    return (
        <main className="container page-enter" style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
            <Link href="/hospitals" style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1.5rem" }}>
                ← Back to Hospitals
            </Link>

            {/* Hospital Header */}
            <div className="card" style={{
                padding: "0",
                overflow: "hidden",
                marginBottom: "2rem"
            }}>
                <div style={{
                    height: "180px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "5rem",
                }}>
                    {hospital.image}
                </div>
                <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>
                                {hospital.name}
                            </h1>
                            <p style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                📍 {hospital.area}, {hospital.city}
                            </p>
                        </div>
                        <div style={{
                            background: "#f0fdf4",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "var(--radius-lg)",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#15803d" }}>⭐ {avgRating}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{reviews.length} reviews</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                        <span className="badge badge-primary">👨‍⚕️ {doctors.length} Doctors</span>
                        <span className="badge badge-success">🕐 24/7 Available</span>
                        <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>⭐ Verified</span>
                    </div>
                </div>
            </div>

            {/* Doctors Section */}
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "1.25rem" }}>Our Doctors</h2>
            {doctors.length === 0 ? (
                <div className="card empty-state" style={{ marginBottom: "2rem" }}>
                    <p className="empty-state-text">No doctors listed yet.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
                    {doctors.map(doc => (
                        <div key={doc.id} className="card card-interactive" style={{ padding: "1.25rem" }}>
                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
                                <div style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                    flexShrink: 0
                                }}>
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: "700", fontSize: "0.95rem" }}>{doc.name}</h4>
                                    <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>{doc.speciality}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>📅 {doc.experience || 10}+ yrs exp</span>
                                <span style={{ fontWeight: "700", color: "var(--accent)" }}>₹{doc.fee || 500}</span>
                            </div>
                            <Link
                                href={`/book?doctorId=${doc.id}&hospitalId=${hospital.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ width: "100%", marginTop: "0.75rem", textAlign: "center" }}
                            >
                                Book Appointment
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews Section */}
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "1.25rem" }}>
                Patient Reviews {reviews.length > 0 && <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
                <div className="card empty-state">
                    <p className="empty-state-text">No reviews yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {reviews.map(review => (
                        <div key={review.id} className="card" style={{ padding: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: "var(--primary-light)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1rem",
                                        flexShrink: 0
                                    }}>
                                        👤
                                    </div>
                                    <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Patient ***{review.patientMobile.slice(-4)}</span>
                                </div>
                                <div style={{
                                    background: "#fef3c7",
                                    padding: "0.15rem 0.6rem",
                                    borderRadius: "99px",
                                    fontWeight: "700",
                                    fontSize: "0.8rem",
                                    color: "#92400e"
                                }}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>
                            <p style={{ color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.6" }}>{review.comment}</p>
                            <p style={{ color: "var(--text-light)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                                {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
