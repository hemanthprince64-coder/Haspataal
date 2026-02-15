import { services } from "@/lib/services";
import Link from "next/link";

export default async function SearchPage({ searchParams }) {
    const params = await searchParams;
    const city = params.city || "Mumbai";
    const speciality = params.speciality || "";
    const query = params.q || "";

    const doctors = services.platform.searchDoctors(city, speciality, query);
    const cities = services.platform.getCities();
    const specialities = services.platform.getAllSpecialities();

    return (
        <main className="container page-enter" style={{ padding: "2rem 1rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--text-main)" }}>
                    {speciality ? `${speciality} Doctors` : "Doctors"} in {city}
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} available for consultation
                </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <form action="/search" method="GET" style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="city" value={city} />
                    {speciality && <input type="hidden" name="speciality" value={speciality} />}
                    <input name="q" type="text" placeholder="Search by doctor name or speciality..." defaultValue={query} className="form-input" style={{ flex: 1, padding: "0.875rem 1rem" }} />
                    <button type="submit" className="btn btn-primary">🔍 Search</button>
                </form>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>City</div>
                <div className="pills-scroll">
                    {cities.map(c => (
                        <Link key={c.id} href={`/search?city=${c.name}${speciality ? `&speciality=${speciality}` : ''}${query ? `&q=${query}` : ''}`} className={`pill ${city === c.name ? 'pill-active' : 'pill-inactive'}`}>{c.name}</Link>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Speciality</div>
                <div className="pills-scroll">
                    <Link href={`/search?city=${city}${query ? `&q=${query}` : ''}`} className={`pill ${!speciality ? 'pill-active' : 'pill-inactive'}`}>All</Link>
                    {specialities.map(s => (
                        <Link key={s} href={`/search?city=${city}&speciality=${s}${query ? `&q=${query}` : ''}`} className={`pill ${speciality === s ? 'pill-active' : 'pill-inactive'}`}>{s}</Link>
                    ))}
                </div>
            </div>

            {doctors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👨‍⚕️</div>
                    <p className="empty-state-title">No doctors found</p>
                    <p className="empty-state-text">Try changing the city, speciality, or search query.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                    {doctors.map(doc => {
                        const hospital = services.platform.getHospitalById(doc.hospitalId);
                        return (
                            <div key={doc.id} className="card card-interactive" style={{ padding: "1.5rem", display: "flex", gap: "1rem" }}>
                                <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>👨‍⚕️</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-main)", fontWeight: "700" }}>{doc.name}</h3>
                                    <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>{doc.speciality}</span>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem", marginBottom: "0.75rem" }}>🏥 {hospital?.name} • 📍 {hospital?.area}, {hospital?.city}</p>
                                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                                        <span style={{ color: "var(--text-muted)" }}>⭐ {hospital?.rating || "4.5"}</span>
                                        <span style={{ color: "var(--text-muted)" }}>📅 {doc.experience || 10}+ yrs</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: "700", color: "var(--accent)", fontSize: "1.2rem" }}>₹{doc.fee || 500}</span>
                                        <Link href={`/book?doctorId=${doc.id}&hospitalId=${doc.hospitalId}`} className="btn btn-primary btn-sm">Book Now →</Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
