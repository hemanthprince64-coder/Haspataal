import * as SecureStore from 'expo-secure-store';

// Use your computer's local IP address effectively. 
// For Android Emulator, 10.0.2.2 usually connects to localhost.
// For Physical Device, use your machine's LAN IP (e.g., 192.168.1.x)
const API_URL = 'http://10.0.2.2:3001/api';

const getHeaders = async () => {
    const token = await SecureStore.getItemAsync('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    get: async (endpoint) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_URL}${endpoint}`, { headers });
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            return { error: 'Network error' };
        }
    },

    post: async (endpoint, body) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            return { error: 'Network error' };
        }
    },

    setToken: async (token) => {
        await SecureStore.setItemAsync('token', token);
    },

    getToken: async () => {
        return await SecureStore.getItemAsync('token');
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
    }
};
