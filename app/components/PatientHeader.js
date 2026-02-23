'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LocationSelector from './LocationSelector';

export default function PatientHeader({ cities }) {
    const [selectedCity, setSelectedCity] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedCity = localStorage.getItem('haspataal_city');
        if (savedCity) setSelectedCity(savedCity);

        // Check if patient is logged in
        const hasCookie = document.cookie.includes('session_patient');
        setIsLoggedIn(hasCookie);
    }, []);

    const handleCityChange = (city) => {
        setSelectedCity(city);
        localStorage.setItem('haspataal_city', city);
        window.location.reload();
    };

    return (
        <header style={{
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            <div className="container" style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textDecoration: 'none'
                }}>
                    <Image src="/logo.svg" alt="Haspataal" width={44} height={44} style={{ objectFit: 'contain' }} />
                    <span className="hide-mobile">Haspataal</span>
                </Link>

                {/* Location Selector */}
                <LocationSelector
                    cities={cities}
                    currentCity={selectedCity}
                    onCityChange={handleCityChange}
                />

                {/* Desktop Navigation */}
                <nav className="hide-mobile" style={{
                    display: 'flex',
                    gap: '0.25rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    alignItems: 'center'
                }}>
                    <NavItem href="/" label="Home" />
                    <NavItem href="/search" label="Doctors" />
                    <NavItem href="/hospitals" label="Hospitals" />
                    {mounted && isLoggedIn ? (
                        <>
                            <NavItem href="/profile" label="My Visits" active />
                            <form action="/api/logout" method="POST" style={{ display: 'inline' }}>
                                <button
                                    type="button"
                                    suppressHydrationWarning
                                    onClick={async () => {
                                        const { logoutPatient } = await import('@/app/actions');
                                        logoutPatient();
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--danger)',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius)',
                                    }}
                                >
                                    Logout
                                </button>
                            </form>
                        </>
                    ) : mounted ? (
                        <Link href="/login" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem' }}>
                            Login
                        </Link>
                    ) : null}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="show-mobile-only"
                    onClick={() => setMenuOpen(!menuOpen)}
                    suppressHydrationWarning
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        color: 'var(--text-main)',
                    }}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="show-mobile-only animate-slide-down" style={{
                    borderTop: '1px solid var(--border)',
                    background: 'white',
                    padding: '1rem',
                }}>
                    <nav style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                    }}>
                        <MobileNavItem href="/" label="🏠 Home" onClick={() => setMenuOpen(false)} />
                        <MobileNavItem href="/search" label="👨‍⚕️ Find Doctors" onClick={() => setMenuOpen(false)} />
                        <MobileNavItem href="/hospitals" label="🏥 Hospitals" onClick={() => setMenuOpen(false)} />
                        {mounted && isLoggedIn ? (
                            <>
                                <MobileNavItem href="/profile" label="📋 My Visits" onClick={() => setMenuOpen(false)} />
                                <button
                                    suppressHydrationWarning
                                    onClick={async () => {
                                        const { logoutPatient } = await import('@/app/actions');
                                        logoutPatient();
                                    }}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--danger-light)',
                                        color: 'var(--danger)',
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🚪 Logout
                                </button>
                            </>
                        ) : mounted ? (
                            <Link href="/login" className="btn btn-primary" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                Login / Register
                            </Link>
                        ) : null}
                    </nav>
                </div>
            )}
        </header>
    );
}

function NavItem({ href, label, active }) {
    return (
        <Link href={href} style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            color: active ? 'var(--primary)' : 'var(--text-main)',
            fontWeight: active ? '600' : '500',
            transition: 'all 0.15s',
            textDecoration: 'none',
        }}>
            {label}
        </Link>
    );
}

function MobileNavItem({ href, label, onClick }) {
    return (
        <Link href={href} onClick={onClick} style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            color: 'var(--text-main)',
            fontWeight: '500',
            fontSize: '0.95rem',
            textDecoration: 'none',
            transition: 'background 0.15s',
        }}>
            {label}
        </Link>
    );
}
