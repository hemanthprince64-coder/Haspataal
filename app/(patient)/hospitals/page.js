"use client";

import Link from "next/link";
import Image from "next/image";

export default function HospitalsPage() {
    const hospitals = [
        {
            id: "hosp-1",
            name: "Apollo Spectra Hospital",
            location: "Koramangala, Bangalore",
            distance: "2.4 km",
            rating: 4.8,
            beds: "150+ Beds",
            image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2072&auto=format&fit=crop"
        },
        {
            id: "hosp-2",
            name: "Fortis Escorts",
            location: "Indiranagar, Bangalore",
            distance: "3.1 km",
            rating: 4.7,
            beds: "200+ Beds",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
        }
    ];

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Partner Hospitals</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Discover trusted healthcare facilities near you</p>
            </div>

            <div className="section">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search hospitals by name or location..."
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button style={{ background: 'var(--blue)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer' }}>
                        🔍
                    </button>
                </div>

                <div>
                    {hospitals.map(hosp => (
                        <div key={hosp.id} className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--grey2)' }}>
                            <div style={{ height: '140px', position: 'relative', background: 'var(--grey2)' }}>
                                <img src={hosp.image} alt={hosp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--amber)' }}>
                                    ⭐ {hosp.rating}
                                </div>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{hosp.name}</h3>
                                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text3)' }}>{hosp.location} • {hosp.distance}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--teal)', background: 'var(--teal-light)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                        {hosp.beds}
                                    </span>
                                    <Link href={`/hospitals/${hosp.id}`} style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none' }}>
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
