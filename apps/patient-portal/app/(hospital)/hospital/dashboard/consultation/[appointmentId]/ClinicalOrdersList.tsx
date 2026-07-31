'use client';

import { ClinicalOrderType, ClinicalOrderStatus, OrderPriority } from '@haspataal/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@haspataal/ui';
import { formatDistanceToNow } from 'date-fns';

export function ClinicalOrdersList({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case ClinicalOrderStatus.ORDERED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ClinicalOrderStatus.ACCEPTED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ClinicalOrderStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ClinicalOrderStatus.VERIFIED:
      case ClinicalOrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ClinicalOrderStatus.CANCELLED:
      case ClinicalOrderStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDuration = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const groupedOrders = {
    pending: orders.filter((o) => o.status === ClinicalOrderStatus.ORDERED),
    active: orders.filter(
      (o) =>
        o.status === ClinicalOrderStatus.ACCEPTED ||
        o.status === ClinicalOrderStatus.SCHEDULED ||
        o.status === ClinicalOrderStatus.IN_PROGRESS,
    ),
    completed: orders.filter(
      (o) =>
        o.status === ClinicalOrderStatus.VERIFIED || o.status === ClinicalOrderStatus.COMPLETED,
    ),
  };

  const renderOrder = (order: any, i: number) => (
    <div
      key={i}
      className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0"
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">
            {order.type === ClinicalOrderType.LAB
              ? '🔬 Lab'
              : order.type === ClinicalOrderType.RADIOLOGY
                ? '🩻 Radiology'
                : `📝 ${order.type}`}
            : {order.payload?.testName || 'Order'}
          </span>
          <Badge
            variant={
              order.priority === OrderPriority.STAT
                ? 'destructive'
                : order.priority === OrderPriority.URGENT
                  ? 'default'
                  : 'secondary'
            }
          >
            {order.priority}
          </Badge>
          <Badge variant="outline" className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
        {order.reason && <p className="text-sm text-gray-500">Reason: {order.reason}</p>}
      </div>
      <div className="text-sm text-gray-500 mt-2 sm:mt-0 flex flex-col items-end">
        <span>{new Date(order.requestedAt).toLocaleString()}</span>
        <span className="font-medium text-gray-700">Waiting {getDuration(order.requestedAt)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mt-8">
      {groupedOrders.pending.length > 0 && (
        <Card className="border-yellow-200 shadow-sm">
          <CardHeader className="bg-yellow-50/50 pb-4">
            <CardTitle className="text-yellow-900">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {groupedOrders.pending.map(renderOrder)}
          </CardContent>
        </Card>
      )}

      {groupedOrders.active.length > 0 && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="text-blue-900">Active / In Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {groupedOrders.active.map(renderOrder)}
          </CardContent>
        </Card>
      )}

      {groupedOrders.completed.length > 0 && (
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="bg-green-50/50 pb-4">
            <CardTitle className="text-green-900">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {groupedOrders.completed.map(renderOrder)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
