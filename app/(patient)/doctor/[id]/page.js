"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function DoctorProfile() {
    const params = useParams();

    // Static data matching prototype
    const doctor = {
        name: "Dr. Arvind Sharma",
        speciality: "Senior Cardiologist",
        hospital: "Apollo Spectra Hospital",
        experience: "15+ Years",
        patients: "8k+",
        rating: "4.9",
        reviews: "124",
        about: "Dr. Arvind Sharma is a leading cardiologist with over 15 years of experience in interventional cardiology. He specializes in advanced heart failure management and preventive cardiology.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
    };

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 60px', textAlign: 'left', background: 'var(--navy)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <Link href="/search" style={{ color: 'white', textDecoration: 'none', fontSize: '24px' }}>←</Link>
                    <h1 style={{ fontSize: '20px', margin: 0 }}>Doctor Profile</h1>
                </div>
            </div>

            <div className="section" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Image src={doctor.image} alt={doctor.name} width={100} height={100} style={{ borderRadius: '24px', objectFit: 'cover', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }} />
                    <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>{doctor.name}</h2>
                    <p style={{ color: 'var(--blue)', fontWeight: '600', margin: '0 0 8px 0', fontSize: '14px' }}>{doctor.speciality}</p>
                    <p style={{ color: 'var(--text3)', margin: '0 0 16px 0', fontSize: '13px' }}>{doctor.hospital}</p>

                    <div style={{ display: 'flex', width: '100%', gap: '12px', justifyContent: 'center' }}>
                        <div style={{ flex: 1, padding: '12px', background: 'var(--grey1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--blue)' }}>{doctor.experience}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Experience</div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: 'var(--grey1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--teal)' }}>{doctor.patients}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Patients</div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: 'var(--grey1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--amber)' }}>⭐ {doctor.rating}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{doctor.reviews} Reviews</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>About Doctor</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text2)' }}>
                    {doctor.about}
                </p>
            </div>

            <div className="section" style={{ paddingBottom: '32px' }}>
                <Link href={`/book/${params.id || 'dr-sharma-123'}`} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '16px' }}>
                    Book Consultation
                </Link>
            </div>
        </>
    );
}
