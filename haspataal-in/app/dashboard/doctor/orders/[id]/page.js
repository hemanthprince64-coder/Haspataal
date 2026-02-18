'use client';

import { useState, useEffect, use } from 'react';
import { getOrderDetails, updateDiagnosticResult, finalizeOrder } from '@/app/actions/doctor';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResultEntryPage({ params }) {
    const { id: orderId } = use(params);
    const router = useRouter();
    // const searchParams = useSearchParams();
    // const doctorId = searchParams.get('doctorId'); // Handled by Session now

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        const res = await getOrderDetails(orderId);
        if (res.success) setOrder(res.data);
        setLoading(false);
    };

    const handleResultSubmit = async (e, orderItemId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('orderItemId', orderItemId);
        // formData.append('doctorId', doctorId || 'unknown'); // Handled by action session

        const res = await updateDiagnosticResult(null, formData);
        if (res.success) {
            alert('Result Saved');
            fetchOrder(); // Refresh to see updated state
        } else {
            alert('Error saving result');
        }
    };

    const handleFinalize = async () => {
        const res = await finalizeOrder(orderId);
        if (res.success) {
            alert('Order Finalized!');
            router.push('/dashboard/doctor/orders');
        }
    };

    if (loading) return <div className="p-6">Loading Order Details...</div>;
    if (!order) return <div className="p-6">Order not found.</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Result Entry</h1>
                    <p className="text-gray-600">Patient: <span className="font-semibold">{order.patient.name}</span></p>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                </div>
                <div>
                    <button
                        onClick={handleFinalize}
                        className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
                    >
                        Finalize & Release Report
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {order.items.map(item => {
                    const existingResult = item.results && item.results[0]; // Assuming 1 result per item for now

                    return (
                        <div key={item.id} className="border p-4 rounded bg-white shadow-sm">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">{item.test.testName}</h3>
                                <span className={`px-2 py-1 rounded text-xs uppercase ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                                    }`}>
                                    Status: {item.status}
                                </span>
                            </div>

                            <form onSubmit={(e) => handleResultSubmit(e, item.id)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Result Value</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="resultValue"
                                            defaultValue={existingResult?.resultValue || ''}
                                            required
                                            className="p-2 border rounded w-full"
                                            placeholder="e.g. 12.5"
                                        />
                                        <span className="p-2 bg-gray-100 rounded text-gray-600 min-w-[60px] text-center">
                                            {item.test.unit || '-'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Normal Range: {item.test.normalRangeText || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Flag</label>
                                    <select
                                        name="resultFlag"
                                        defaultValue={existingResult?.resultFlag || 'normal'}
                                        className="p-2 border rounded w-full"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="low">Low</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
                                    >
                                        Save Result
                                    </button>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium mb-1">Notes / Methodology</label>
                                    <input
                                        type="text"
                                        name="notes"
                                        defaultValue={existingResult?.structuredData?.notes || ''}
                                        className="p-2 border rounded w-full text-sm"
                                        placeholder="Optional technical notes..."
                                    />
                                </div>
                            </form>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
