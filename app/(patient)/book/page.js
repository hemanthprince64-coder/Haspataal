import { services } from "@/lib/services";
import BookingForm from "./BookingForm";

export default async function BookingPage({ searchParams }) {
    const params = await searchParams;
    const doctorId = params.doctorId;
    const hospitalId = params.hospitalId;

    const [doctor, hospital] = await Promise.all([
        doctorId ? services.platform.getDoctorById(doctorId) : Promise.resolve(null),
        hospitalId ? services.platform.getHospitalById(hospitalId) : Promise.resolve(null)
    ]);

    if (!doctor || !hospital) {
        return (
            <div className="container page-enter" style={{ padding: "4rem 1rem", textAlign: "center" }}>
                <div className="empty-state">
                    <div className="empty-state-icon">⚠️</div>
                    <p className="empty-state-title">No doctor selected</p>
                    <p className="empty-state-text">Please go back to the search page and select a doctor to book.</p>
                    <a href="/search" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
                        ← Find Doctors
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-enter" style={{ padding: "2rem 1rem", maxWidth: "700px" }}>
            <a href="/search" style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1.5rem" }}>
                ← Back to Search
            </a>

            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "1.5rem" }}>Book Appointment</h1>

            {/* Doctor Info Card */}
            <div className="card" style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    flexShrink: 0
                }}>
                    👨‍⚕️
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                        {doctor.fullName || doctor.name || 'Doctor'}
                    </h3>
                    <span className="badge badge-primary">
                        {doctor.affiliations?.find(a => a.hospitalId === hospitalId)?.department || 'General Physician'}
                    </span>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        🏥 {hospital.legalName || hospital.displayName || 'Hospital'} • 📍 {hospital.addressLine1 || hospital.area || 'Location'}, {hospital.city}
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", fontSize: "1.3rem", color: "var(--accent)" }}>₹{doctor.fee || hospital.consultationFee || 500}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>consultation</div>
                </div>
            </div>

            {/* Booking Form */}
            <BookingForm doctorId={doctorId} hospitalId={hospitalId} />
        </div>
    );
}
