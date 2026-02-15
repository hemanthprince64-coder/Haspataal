'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export default function SearchPage() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [city, setCity] = useState('');
    const [userLoc, setUserLoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch doctors
        fetch('/api/doctors')
            .then(res => res.json())
            .then(data => {
                setDoctors(data);
                setFilteredDoctors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Get User Location silently if allowed
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }, (err) => console.log('Location access not granted or error'));
        }
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = doctors;

        if (city) {
            result = result.filter(d => d.hospital?.city?.toLowerCase().includes(city.toLowerCase()));
        }

        if (userLoc) {
            // Sort by distance
            result = result.map(d => {
                if (!d.hospital?.lat || !d.hospital?.lng) return { ...d, distance: 9999 };
                const dist = getDistance(userLoc.lat, userLoc.lng, d.hospital.lat, d.hospital.lng);
                return { ...d, distance: dist };
            }).sort((a, b) => a.distance - b.distance);
        }

        setFilteredDoctors(result);
    }, [city, userLoc, doctors]);


    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Find a Doctor {city && `in ${city}`}</h1>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        className="form-input"
                        onChange={(e) => setCity(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '5px' }}
                    >
                        <option value="">All Cities</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                    </select>

                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                    alert(`Location detected! Sorting by distance.`);
                                }, () => alert('Location access denied.'));
                            } else {
                                alert('Geolocation not supported');
                            }
                        }}
                    >
                        📍 Near Me
                    </button>
                </div>
            </div>

            {loading ? <p>Loading doctors...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{doctor.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '500' }}>{doctor.specialty}</p>
                                </div>
                                <span style={{
                                    background: '#e0f2fe', color: '#0284c7',
                                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                                }}>
                                    {doctor.experience || 0} yrs exp
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <p>🏥 {doctor.hospital?.name}</p>
                                <p>📍 {doctor.hospital?.city}</p>
                                {doctor.distance && doctor.distance < 9999 && (
                                    <p style={{ color: 'green', fontWeight: 'bold' }}>🏃 {doctor.distance.toFixed(1)} km away</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{doctor.fee}</span>
                                <Link href={`/book/${doctor.id}`} className="btn btn-primary">
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredDoctors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No doctors found matching filters.
                </div>
            )}
        </div>
    );
}
