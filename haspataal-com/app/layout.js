import "./globals.css";
import PatientHeader from './components/PatientHeader';
import { services } from '@/lib/services';
import Link from 'next/link';

export const metadata = {
    title: "Haspataal — Healthcare Assistance Platform",
    description: "India's smart hospital assistance platform connecting patients with local hospitals for outpatient consultations, diagnostic services and inpatient services.",
    keywords: "healthcare, hospital, doctor, appointment, OPD, India, Haspataal",
    icons: {
        icon: "/logo.svg",
    },
};

export default function RootLayout({ children }) {
    const cities = services.platform.getCities();

    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <PatientHeader cities={cities} />
                    <main style={{ flex: 1 }}>
                        {children}
                    </main>
                    <footer style={{
                        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                        color: '#94a3b8',
                        padding: '3rem 1rem 1.5rem',
                        marginTop: 'auto'
                    }}>
                        <div className="container" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '2rem',
                            marginBottom: '2rem'
                        }}>
                            <div>
                                <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.75rem', fontSize: '1.15rem' }}>
                                    🏥 Haspataal
                                </h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                                    India's smart hospital assistance platform. Connecting patients with the right healthcare, one step at a time.
                                </p>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Quick Links</h4>
                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <Link href="/search" style={{ color: '#94a3b8', textDecoration: 'none' }}>Find Doctors</Link>
                                    <Link href="/hospitals" style={{ color: '#94a3b8', textDecoration: 'none' }}>View Hospitals</Link>
                                    <Link href="/profile" style={{ color: '#94a3b8', textDecoration: 'none' }}>My Appointments</Link>
                                    <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Patient Login</Link>
                                </nav>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem' }}>For Hospitals</h4>
                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <a href="https://haspataal.in" style={{ color: '#94a3b8', textDecoration: 'none' }}>Partner Portal</a>
                                    <a href="https://haspataal.in/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>Register Hospital</a>
                                    <a href="https://haspataal.in/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hospital Login</a>
                                </nav>
                            </div>

                            <div>
                                <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Contact</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>📧 support@haspataal.com</span>
                                    <span>📱 1800-HASPATAAL</span>
                                    <span>📍 New Delhi, India</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                © {new Date().getFullYear()} Haspataal. All rights reserved. Built with 💙 for better healthcare.
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
