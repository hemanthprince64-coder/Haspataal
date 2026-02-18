'use client';

import { useState, useEffect } from 'react';
import { getHospitalCatalog, updateDiagnosticPrice } from '@/app/actions/admin';

export default function DiagnosticPricingPage() {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simulate getting hospital ID (In real app, from session)
    // For testing, we'll fetch the first hospital from the DB or let user input
    // But since this is client side, we can't fetch DB directly.
    // We'll use a hardcoded valid ID from verified data for now or input field.

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        setLoading(true);
        const res = await getHospitalCatalog();
        if (res.success) {
            setCatalog(res.data);
        } else {
            alert(res.message);
        }
        setLoading(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const res = await updateDiagnosticPrice(null, formData);
        if (res.success) {
            alert('Price Updated');
            fetchCatalog(); // Refresh
        } else {
            alert('Failed');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Diagnostic Pricing Manager</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">Test Name</th>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">Global TAT (Hrs)</th>
                                <th className="p-2 border">Your Price (₹)</th>
                                <th className="p-2 border">Available</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalog.map((test) => (
                                <tr key={test.id} className="border-t">
                                    <td className="p-2">{test.testName}</td>
                                    <td className="p-2">{test.category?.name}</td>
                                    <td className="p-2">{test.turnaroundTimeHours}</td>
                                    <td className="p-2" colSpan="3">
                                        <form onSubmit={handleUpdate} className="flex gap-2 items-center">
                                            <input type="hidden" name="testId" value={test.id} />
                                            <input
                                                type="number"
                                                name="price"
                                                defaultValue={test.price || 0}
                                                className="p-1 border rounded w-24"
                                            />
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    name="isAvailable"
                                                    defaultChecked={test.isAvailable}
                                                />
                                                Active
                                            </label>
                                            <button
                                                type="submit"
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
