'use client';

import { useState, useEffect } from 'react';
import { getDoctorOrders } from '@/app/actions/doctor';
import Link from 'next/link';

export default function DoctorOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getDoctorOrders(); // No args needed, uses session
        if (res.success) setOrders(res.data);
        else alert(res.message);
        setLoading(false);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Lab / Doctor Dashboard</h1>

            {loading ? <p>Loading...</p> : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="border p-4 rounded shadow bg-white hover:shadow-md transition">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h3 className="font-bold">By: {order.doctor?.fullName || 'Self/Unknown'}</h3>
                                    <p className="text-sm">Patient: {order.patient.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                    <div className="mt-2">
                                        <Link
                                            href={`/dashboard/doctor/orders/${order.id}`}
                                            className="text-blue-600 underline text-sm"
                                        >
                                            Enter Results &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && !loading && <p className="text-gray-500">No orders found.</p>}
                </div>
            )}
        </div>
    );
}
