'use client';
import { useState, useEffect } from 'react';

export default function NotificationAdminPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0 });

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.data || []));

    fetch('/api/notifications/analytics')
      .then((res) => res.json())
      .then((data) => setStats(data.data || {}));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notification Management</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">Sent: {stats.sent}</div>
        <div className="bg-red-50 p-4 rounded">Failed: {stats.failed}</div>
        <div className="bg-yellow-50 p-4 rounded">Pending: {stats.pending}</div>
        <div className="bg-green-50 p-4 rounded">Total: {notifications.length}</div>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Recipient</th>
            <th className="p-2 text-left">Channel</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n: any) => (
            <tr key={n.id} className="border-b">
              <td className="p-2">{n.recipient}</td>
              <td className="p-2">{n.channel}</td>
              <td className="p-2">{n.status}</td>
              <td className="p-2">{new Date(n.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
