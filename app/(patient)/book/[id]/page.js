"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BookAppointment() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState("mon");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedType, setSelectedType] = useState("clinic");

    const handleBooking = () => {
        if (!selectedTime) return alert("Please select a time slot");
        alert("Appointment Confirmed successfully!");
        router.push("/records");
    };

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <Link href="/search" style={{ color: 'white', textDecoration: 'none', fontSize: '24px' }}>←</Link>
                    <h1 style={{ fontSize: '20px', margin: 0 }}>Book Appointment</h1>
                </div>
            </div>

            <div className="section" style={{ paddingTop: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div
                        onClick={() => setSelectedType('clinic')}
                        style={{
                            flex: 1, padding: '16px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                            border: selectedType === 'clinic' ? '2px solid var(--blue)' : '1px solid var(--grey2)',
                            background: selectedType === 'clinic' ? 'var(--blue-light)' : 'white'
                        }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>In-Clinic</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>₹800</div>
                    </div>
                    <div
                        onClick={() => setSelectedType('video')}
                        style={{
                            flex: 1, padding: '16px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                            border: selectedType === 'video' ? '2px solid var(--blue)' : '1px solid var(--grey2)',
                            background: selectedType === 'video' ? 'var(--blue-light)' : 'white'
                        }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💻</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Video Consult</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>₹600</div>
                    </div>
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Date</h3>
                <div className="pills-scroll" style={{ marginBottom: '24px' }}>
                    {['Mon, 12', 'Tue, 13', 'Wed, 14', 'Thu, 15', 'Fri, 16'].map((date, i) => {
                        const val = date.split(',')[0].toLowerCase();
                        return (
                            <button
                                key={val}
                                className={`pill ${selectedDate === val ? 'pill-active' : 'pill-inactive'}`}
                                onClick={() => setSelectedDate(val)}
                                style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                            >
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>{date.split(',')[0]}</span>
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{date.split(',')[1]}</span>
                            </button>
                        )
                    })}
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Available Slots</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px' }}>
                    {['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'].map(time => (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            style={{
                                padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                background: selectedTime === time ? 'var(--blue)' : 'white',
                                color: selectedTime === time ? 'white' : 'var(--text)',
                                border: selectedTime === time ? 'none' : '1px solid var(--grey2)'
                            }}
                        >
                            {time}
                        </button>
                    ))}
                </div>

                <button onClick={handleBooking} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '16px' }}>
                    Confirm & Pay
                </button>
            </div>
        </>
    );
}
