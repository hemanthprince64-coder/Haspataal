"use client";

import Link from "next/link";

export default function PatientHome() {
    const services = [
        {
            title: "OPD Consultation",
            description: "Get assistance in choosing the correct specialist, comparing hospitals, and scheduling OPD consultations with accuracy and care",
            icon: "🏥",
            gradient: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
        },
        {
            title: "In-Patient Services",
            description: "Complete hospital support for patients who require admission and continuous medical care with smooth hospital stays",
            icon: "🛏️",
            gradient: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)"
        },
        {
            title: "Diagnostic Services",
            description: "Access accurate lab tests and imaging services through trusted diagnostic centers for clarity and timely results",
            icon: "🔬",
            gradient: "linear-gradient(135deg, #fdf4ff 0%, #e9d5ff 100%)"
        },
        {
            title: "Digital Health Records",
            description: "Securely store and access your past and present medical records, including investigations and imaging reports",
            icon: "📋",
            gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
        }
    ];

    const values = [
        { title: "Assistance", description: "End-to-end guidance to help patients choose the right doctors, hospitals, and services", icon: "🤝", color: "#0284c7" },
        { title: "Accuracy", description: "Focused on correct information, right referrals and reliable healthcare decisions", icon: "🎯", color: "#0d9488" },
        { title: "Accessibility", description: "Easy access to healthcare services, records, and support anytime, anywhere", icon: "🌐", color: "#7c3aed" },
        { title: "Accountability", description: "Dedicated patient support with transparent processes and dependable coordination", icon: "✅", color: "#ea580c" }
    ];

    const specialities = [
        { name: 'Gynecology', icon: '👩‍⚕️' },
        { name: 'General Physician', icon: '🩺' },
        { name: 'Dermatology', icon: '🧴' },
        { name: 'Pediatrics', icon: '👶' },
        { name: 'ENT', icon: '👂' },
        { name: 'Cardiology', icon: '❤️' },
        { name: 'Orthopedics', icon: '🦴' },
        { name: 'Neurology', icon: '🧠' }
    ];

    return (
        <main>
            {/* Hero Section */}
            <section style={{
                background: "radial-gradient(ellipse at top, #eff6ff 0%, #ffffff 100%)",
                padding: "6rem 1rem 3rem",
                position: "relative",
                overflow: "hidden",
                textAlign: "center"
            }}>
                <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "850px" }}>

                    {/* Top Trust Badge */}
                    <div className="animate-fade-in-up" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "#f0fdfa",
                        color: "#0f766e",
                        padding: "0.5rem 1rem",
                        borderRadius: "9999px",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        marginBottom: "1.5rem",
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid #ccfbf1"
                    }}>
                        <span style={{ fontSize: "1rem" }}>🌟</span> India&apos;s Most Trusted Healthcare Network
                    </div>

                    <h1 className="animate-fade-in-up delay-1" style={{
                        fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                        fontWeight: "800",
                        color: "var(--text-main)",
                        lineHeight: "1.1",
                        marginBottom: "1.5rem",
                        letterSpacing: "-0.03em"
                    }}>
                        Find the Right <span style={{ color: "var(--primary)" }}>Doctor</span>. <br />
                        At the Right <span style={{ color: "var(--accent)" }}>Hospital</span>.
                    </h1>

                    <p className="animate-fade-in-up delay-2" style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                        color: "var(--text-muted)",
                        lineHeight: "1.6",
                        marginBottom: "2.5rem",
                        fontWeight: "400",
                        maxWidth: "600px",
                        margin: "0 auto 2.5rem"
                    }}>
                        Search availability, compare reviews, and book confirmed appointments across top-rated medical facilities instantly.
                    </p>

                    {/* Centered Search Bar */}
                    <form action="/search" method="GET" className="animate-fade-in-up delay-3" style={{
                        display: "flex",
                        gap: "0.5rem",
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "var(--radius-full)",
                        boxShadow: "var(--shadow-lg)",
                        maxWidth: "700px",
                        margin: "0 auto 2rem",
                        border: "1px solid var(--border)",
                        position: "relative",
                        transition: "box-shadow 0.2s"
                    }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: "1rem" }}>
                            <span style={{ fontSize: "1.25rem", color: "var(--text-light)", marginRight: "0.5rem" }}>🔍</span>
                            <input
                                type="text"
                                name="q"
                                suppressHydrationWarning
                                placeholder="Search by doctor, hospital, or speciality..."
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    fontSize: "1.05rem",
                                    color: "var(--text-main)",
                                    background: "transparent",
                                    boxShadow: 'none',
                                    padding: '0.5rem 0'
                                }}
                            />
                        </div>
                        <button type="submit" suppressHydrationWarning className="btn btn-primary" style={{ borderRadius: "9999px", padding: "0.875rem 2rem", fontSize: "1rem" }}>
                            Search
                        </button>
                    </form>

                    {/* Trust Signals */}
                    <div className="animate-fade-in-up delay-4" style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "2rem",
                        flexWrap: "wrap",
                        marginBottom: "4rem",
                        color: "var(--text-muted)",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>✅ Verified Doctors</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>🔒 Secure Booking</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>🚑 24/7 Support</span>
                    </div>

                </div>
            </section>

            {/* Stats Bar */}
            <section style={{
                background: "white",
                borderBottom: "1px solid var(--border)",
                padding: "0 1rem",
                marginTop: "0",
                position: "relative",
                zIndex: 2
            }}>
                <div className="container" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    background: "white",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-xl)",
                    overflow: "hidden"
                }}>
                    {[
                        { num: "12+", label: "Hospitals", color: "#0284c7" },
                        { num: "21+", label: "Doctors", color: "#0d9488" },
                        { num: "8", label: "Cities", color: "#7c3aed" },
                        { num: "24/7", label: "Support", color: "#ea580c" },
                    ].map((stat, i) => (
                        <div key={stat.label} style={{
                            padding: "1.5rem 1rem",
                            textAlign: "center",
                            borderRight: i < 3 ? "1px solid var(--border)" : "none"
                        }}>
                            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: stat.color }}>{stat.num}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section className="container" style={{ padding: "5rem 1rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                        What We Offer
                    </p>
                    <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.75rem" }}>
                        Our Services
                    </h2>
                    <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.7" }}>
                        Patient-centric healthcare assistance at every step of your medical journey
                    </p>
                </div>

                <div className="services-grid">
                    {services.map((service, i) => (
                        <div key={service.title} className="card card-interactive service-card" style={{
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                width: "70px",
                                height: "70px",
                                background: service.gradient,
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem",
                                margin: "0 auto 1.25rem",
                            }}>
                                {service.icon}
                            </div>
                            <h3 style={{ color: "var(--text-main)", marginBottom: "0.75rem", fontSize: "1.15rem", fontWeight: "700" }}>
                                {service.title}
                            </h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.7" }}>
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Specialities */}
            <section className="container" style={{ padding: "5rem 1rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                        Browse By
                    </p>
                    <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-main)" }}>
                        Popular Specialities
                    </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                    {specialities.map(spec => (
                        <Link href={`/search?speciality=${spec.name}`} key={spec.name} className="card card-interactive" style={{
                            padding: "1.5rem 1rem",
                            textAlign: "center",
                            textDecoration: "none",
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{spec.icon}</div>
                            <div style={{
                                fontWeight: "600",
                                color: "var(--primary)",
                                fontSize: "0.85rem"
                            }}>
                                {spec.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", padding: "5rem 1rem" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                            The 4 A&apos;s
                        </p>
                        <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)" }}>
                            Why Choose Haspataal
                        </h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
                        {values.map(value => (
                            <div key={value.title} style={{ textAlign: "center" }}>
                                <div style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "1rem",
                                    width: "90px",
                                    height: "90px",
                                    background: "white",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 1.25rem",
                                    boxShadow: "var(--shadow-lg)",
                                    border: `3px solid ${value.color}20`,
                                }}>
                                    {value.icon}
                                </div>
                                <h3 style={{ color: value.color, marginBottom: "0.5rem", fontSize: "1.15rem", fontWeight: "700" }}>
                                    {value.title}
                                </h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "280px", margin: "0 auto" }}>
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)",
                color: "white",
                padding: "5rem 1rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                }} />
                <div className="container" style={{ position: "relative" }}>
                    <h2 style={{ fontSize: "2.25rem", fontWeight: "800", marginBottom: "1rem" }}>
                        Your Guide to Better Healthcare
                    </h2>
                    <p style={{ opacity: 0.9, marginBottom: "2.5rem", maxWidth: "550px", margin: "0 auto 2.5rem", lineHeight: "1.7" }}>
                        From choosing the right doctor & hospital to managing medical records, Haspataal supports patients at every step
                    </p>
                    <Link href="/search" className="btn btn-lg" style={{
                        background: "white",
                        color: "#0284c7",
                        fontWeight: "700",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}>
                        ✨ Get Assistance Now
                    </Link>
                </div>
            </section>

        </main>
    );
}
