'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
                    <p style={{ color: 'red', marginBottom: '1.5rem' }}>{error.message || "Unknown error occurred"}</p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
