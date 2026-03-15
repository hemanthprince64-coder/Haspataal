const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4001';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('haspataal_hms_token');
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    return res.json();
}

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const res = await fetch(`${AUTH_BASE}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.access_token) localStorage.setItem('haspataal_hms_token', data.access_token);
            return data;
        },
        logout: () => localStorage.removeItem('haspataal_hms_token'),
    },
    hospital: {
        getPatients: (hospitalId: string) => apiRequest(`/v1/hospitals/${hospitalId}/patients`),
        getAppointments: (hospitalId: string) => apiRequest(`/v1/hospitals/${hospitalId}/appointments`),
    },
};
