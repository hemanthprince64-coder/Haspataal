'use client';

import { useState, useEffect } from 'react';
import { getHospitalOrders, updateOrderStatus } from '@/app/actions/admin';

export default function OrderManagementPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getHospitalOrders();
        if (res.success) setOrders(res.data);
        setLoading(false);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('status', newStatus);

        const res = await updateOrderStatus(null, formData);
        if (res.success) {
            fetchOrders();
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Order Management</h1>

            {loading ? <p>Loading...</p> : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="border p-4 rounded shadow bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold">Order #{order.id.slice(0, 8)}</h3>
                                    <p className="text-sm text-gray-600">Patient: {order.patient.name} ({order.patient.phone})</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-sm font-bold ${order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.orderStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 border-t pt-2">
                                <h4 className="text-sm font-semibold">Tests:</h4>
                                <ul className="list-disc pl-5 text-sm">
                                    {order.items.map(item => (
                                        <li key={item.id}>{item.test.testName} (₹{item.priceAtOrder})</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Mark Processing
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Mark Completed
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
