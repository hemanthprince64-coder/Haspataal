"use client";

import Image from "next/image";
import Link from "next/link";
import DoctorCard from "../components/DoctorCard";

export default function PatientHome() {
    const topDoctors = [
        {
            id: "dr-sharma-123",
            name: "Dr. Arvind Sharma",
            speciality: "Senior Cardiologist",
            hospital: "Apollo Spectra",
            distance: "2.4 km",
            fees: 800,
            matches: 98,
            stars: 4.9,
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        },
        {
            id: "dr-gupta-456",
            name: "Dr. Meera Gupta",
            speciality: "Pediatrician",
            hospital: "Fortis Escorts",
            distance: "3.1 km",
            fees: 600,
            matches: 95,
            stars: 4.8,
            image: "https://images.unsplash.com/photo-1594824436998-38290fbb6948?q=80&w=2070&auto=format&fit=crop",
        }
    ];

    return (
        <>
            <div className="page-header">
                <div className="page-header-inner">
                    <div className="cross-icon"><img src="/logo.svg" alt="Haspataal" style={{ width: '48px', height: '56px' }} /></div>
                    <h1>Haspataal<span>.</span></h1>
                    <p>Your Health. Connected.</p>
                    <div className="trust-bar">
                        <div className="trust-item">
                            <div className="trust-item-icon">⚡</div> Fast OPD
                        </div>
                        <div className="trust-item">
                            <div className="trust-item-icon">🏥</div> 50+ Hospitals
                        </div>
                        <div className="trust-item">
                            <div className="trust-item-icon">🔒</div> Secure Data
                        </div>
                    </div>
                </div>
            </div>

            <div className="section" style={{ marginTop: "-20px", position: "relative", zIndex: 10 }}>
                <div className="quick-grid">
                    <Link href="/search" className="quick-item" style={{ textDecoration: 'none' }}>
                        <div className="quick-icon" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>👨‍⚕️</div>
                        <span>Doctors</span>
                    </Link>
                    <Link href="/hospitals" className="quick-item" style={{ textDecoration: 'none' }}>
                        <div className="quick-icon" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>🏥</div>
                        <span>Hospitals</span>
                    </Link>
                    <Link href="/lab-tests" className="quick-item" style={{ textDecoration: 'none' }}>
                        <div className="quick-icon" style={{ background: "#F3E8FF", color: "#9333EA" }}>🔬</div>
                        <span>Lab Tests</span>
                    </Link>

                </div>
            </div>

            <div className="section">
                <div className="section-head">
                    <h3>Top Doctors Near You</h3>
                    <Link href="/search" className="see-all">See All</Link>
                </div>
                <div>
                    {topDoctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))}
                </div>
            </div>

            <div className="section" style={{ paddingBottom: '24px' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--red) 0%, #7f1d1d 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ color: 'white', marginBottom: '4px', fontSize: '18px' }}>Emergency SOS</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '13px' }}>Need an ambulance instantly?</p>
                        </div>
                        <Link href="/emergency" style={{ background: 'white', color: 'var(--red)', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
                            Call Now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
