"use client";

import { useState } from "react";
import Link from "next/link";
import DoctorCard from "../components/DoctorCard";

export default function SearchPage() {
    const [activeTab, setActiveTab] = useState("all");

    const doctors = [
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
        },
        {
            id: "dr-patel-789",
            name: "Dr. Rajesh Patel",
            speciality: "Orthopedic Surgeon",
            hospital: "Max Super Speciality",
            distance: "4.5 km",
            fees: 1000,
            matches: 92,
            stars: 4.7,
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop",
        },
        {
            id: "dr-reddy-101",
            name: "Dr. Sneha Reddy",
            speciality: "Dermatologist",
            hospital: "Care Hospitals",
            distance: "1.8 km",
            fees: 500,
            matches: 99,
            stars: 4.9,
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
        }
    ];

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Find a Doctor</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Search doctors, specialities..."
                        className="form-input"
                        style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                    <button style={{ background: 'var(--blue)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer' }}>
                        🔍
                    </button>
                </div>
            </div>

            <div className="section" style={{ paddingTop: '16px' }}>
                <div className="pills-scroll" style={{ marginBottom: '20px' }}>
                    <button className={`pill ${activeTab === 'all' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab("all")}>All Doctors</button>
                    <button className={`pill ${activeTab === 'physician' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab("physician")}>Gen. Physician</button>
                    <button className={`pill ${activeTab === 'cardio' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab("cardio")}>Cardiologist</button>
                    <button className={`pill ${activeTab === 'dental' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab("dental")}>Dentist</button>
                </div>

                <div>
                    {doctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))}
                </div>
            </div>
        </>
    );
}
