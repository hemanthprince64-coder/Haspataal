'use client';

import { useState, useEffect } from 'react';
import { getHospitalOrders, updateOrderStatus } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Button } from '@haspataal/ui';
import { Badge } from '@haspataal/ui';
import { Skeleton } from '@haspataal/ui';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ClipboardList className="h-6 w-6" />
        Order Management
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Patient: {order.patient.name} ({order.patient.phone})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.orderStatus)}
                    <Badge variant={getStatusVariant(order.orderStatus)}>
                      {order.orderStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Tests:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.test.testName} - ₹{item.priceAtOrder}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex gap-2">
                  {order.orderStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                      >
                        Mark Processing
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {order.orderStatus === 'processing' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
