import { services } from "@/lib/services";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HospitalsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const city = params.city || "Mumbai";

    const hospitals = await services.platform.getHospitalsByCity(city);
    const cities = services.platform.getCities();

    // Pre-resolve doctor counts and reviews for all hospitals (avoid await inside .map)
    const hospitalsWithData = await Promise.all(
        hospitals.map(async (hospital) => {
            const doctors = await services.platform.getHospitalDoctors(hospital.id);
            const reviews = await services.platform.getHospitalReviews(hospital.id);
            const avgRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : "4.5";
            return {
                ...hospital,
                doctorCount: doctors.length,
                reviews,
                avgRating,
                name: hospital.displayName || hospital.legalName,
            };
        })
    );

    return (
        <main className="container page-enter" style={{ padding: "2rem 1rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--text-main)" }}>
                    Hospitals in {city}
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    {hospitalsWithData.length} hospitals providing quality healthcare
                </p>
            </div>

            {/* City Filter Pills */}
            <div style={{ marginBottom: "2rem" }}>
                <div className="pills-scroll">
                    {cities.map(c => (
                        <Link
                            key={c.id}
                            href={`/hospitals?city=${c.name}`}
                            className={`pill ${city === c.name ? 'pill-active' : 'pill-inactive'}`}
                        >
                            {c.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Hospital Cards */}
            {hospitalsWithData.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏥</div>
                    <p className="empty-state-title">No hospitals found in {city}</p>
                    <p className="empty-state-text">Try selecting another city to find hospitals.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {hospitalsWithData.map(hospital => (
                        <div key={hospital.id} className="card card-interactive" style={{
                            padding: "0",
                            overflow: "hidden",
                        }}>
                            {/* Hospital Image Banner */}
                            <div style={{
                                height: "130px",
                                background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "3.5rem",
                                position: "relative"
                            }}>
                                🏥
                                {/* Rating overlay */}
                                <div style={{
                                    position: "absolute",
                                    top: "0.75rem",
                                    right: "0.75rem",
                                    background: "rgba(255,255,255,0.95)",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "99px",
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                    color: "#15803d",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem"
                                }}>
                                    ⭐ {hospital.avgRating}
                                </div>
                            </div>

                            <div style={{ padding: "1.25rem" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-main)" }}>
                                    {hospital.name}
                                </h3>

                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                    📍 {hospital.addressLine1 || hospital.city}, {hospital.city}
                                </p>

                                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                                    <span className="badge badge-primary">👨‍⚕️ {hospital.doctorCount} Doctors</span>
                                    <span className="badge badge-success">🕐 Open 24x7</span>
                                    {hospital.reviews.length > 0 && <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>💬 {hospital.reviews.length} Reviews</span>}
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <Link
                                        href={`/hospitals/${hospital.id}`}
                                        className="btn btn-outline btn-sm"
                                        style={{ flex: 1, textAlign: "center" }}
                                    >
                                        View Details
                                    </Link>
                                    <Link
                                        href={`/search?city=${hospital.city}`}
                                        className="btn btn-primary btn-sm"
                                        style={{ flex: 1, textAlign: "center" }}
                                    >
                                        View Doctors
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
