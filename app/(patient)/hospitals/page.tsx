import { services } from "../../../lib/services";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HospitalsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const city = (params.city as string) || "Mumbai";

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
                                height: "140px",
                                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
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
                                    top: "1rem",
                                    right: "1rem",
                                    background: "rgba(255,255,255,0.95)",
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "99px",
                                    fontSize: "0.85rem",
                                    fontWeight: "700",
                                    color: "var(--text-main)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    boxShadow: "var(--shadow-sm)"
                                }}>
                                    <span style={{ color: "#fbbf24" }}>★</span>
                                    <span>{hospital.avgRating}</span>
                                    <span style={{ color: "var(--text-light)", fontWeight: "500", marginLeft: "0.1rem", fontSize: "0.8rem" }}>
                                        ({hospital.reviews.length || '12'})
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-main)", margin: 0, lineHeight: 1.2 }}>
                                        {hospital.name}
                                    </h3>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                                    <span style={{
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                        background: "var(--bg-input)",
                                        color: "var(--text-muted)",
                                        padding: "0.25rem 0.65rem",
                                        borderRadius: "6px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.25rem"
                                    }}>
                                        📍 {hospital.addressLine1 || hospital.city}
                                    </span>
                                    <span style={{
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                        background: "var(--primary-light)",
                                        color: "var(--primary)",
                                        padding: "0.25rem 0.65rem",
                                        borderRadius: "6px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.25rem"
                                    }}>
                                        🏙️ {hospital.city}
                                    </span>
                                </div>

                                <div style={{
                                    display: "flex",
                                    gap: "1.5rem",
                                    fontSize: "0.85rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "1.5rem",
                                    paddingBottom: "1.5rem",
                                    borderBottom: "1px solid var(--border)"
                                }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "1.1rem" }}>{hospital.doctorCount}</span>
                                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Doctors</span>
                                    </div>
                                    <div style={{ width: "1px", background: "var(--border)" }} />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontWeight: "700", color: "var(--success)", fontSize: "1.1rem" }}>24x7</span>
                                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Emergency</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <Link
                                        href={`/hospitals/${hospital.id}`}
                                        className="btn btn-outline"
                                        style={{ flex: 1, textAlign: "center", padding: "0.6rem" }}
                                    >
                                        Details
                                    </Link>
                                    <Link
                                        href={`/search?city=${hospital.city}`}
                                        className="btn btn-primary"
                                        style={{ flex: 1, textAlign: "center", padding: "0.6rem" }}
                                    >
                                        Book Now
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
