'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [role, setRole] = useState('admin');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('1234'); // Default for prototype
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn('credentials', {
            redirect: false,
            mobile,
            password,
            role
        });

        if (res?.error) {
            alert('Invalid Credentials or Role');
            setLoading(false);
        } else {
            // Redirect based on role
            if (role === 'admin') router.push('/dashboard/admin/orders');
            else router.push('/dashboard/doctor/orders');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Provider Login</h1>

                <div className="flex bg-gray-100 rounded p-1 mb-6">
                    <button
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 rounded text-sm font-medium ${role === 'admin' ? 'bg-white shadow' : 'text-gray-500'}`}
                    >
                        Hospital Admin
                    </button>
                    <button
                        onClick={() => setRole('doctor')}
                        className={`flex-1 py-2 rounded text-sm font-medium ${role === 'doctor' ? 'bg-white shadow' : 'text-gray-500'}`}
                    >
                        Doctor / Lab
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <input
                            type="text"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="border-t mt-6 pt-4 text-xs text-gray-500 text-center">
                    Prototype: Use verification script data.
                    <br />
                    Password is '1234' for all demo accounts.
                </p>
            </div>
        </div>
    );
}
