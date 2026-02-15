'use client';
import { useState, useEffect } from 'react';

export default function LocationSelector({ cities, currentCity, onCityChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            {/* Location Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    minWidth: '180px',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <span style={{ fontSize: '1.25rem' }}>📍</span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                    {currentCity || 'Select City'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>▼</span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 99
                        }}
                    />

                    {/* Dropdown Menu */}
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        width: '300px',
                        overflow: 'hidden'
                    }}>
                        {/* Search */}
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <input
                                type="text"
                                placeholder="Search city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem'
                                }}
                                autoFocus
                            />
                        </div>

                        {/* City List */}
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {filteredCities.map(city => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        onCityChange(city.name);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '1rem',
                                        border: 'none',
                                        background: currentCity === city.name ? '#e0f2fe' : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🏙️</span>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{city.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{city.state}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Detect Location */}
                        <button
                            onClick={() => {
                                alert('In a real app, this would detect your location via GPS');
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '1rem',
                                border: 'none',
                                borderTop: '1px solid var(--border)',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                color: 'var(--primary)',
                                fontWeight: '600'
                            }}
                        >
                            <span>📱</span>
                            Detect my location
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
