'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import AlertActionModal from '@/components/hospital/alerts/AlertActionModal';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  createdAt: string;
  patientId: string;
  resolvedAt: string | null;
  acknowledgedAt: string | null;
  ackNote: string | null;
  patient: { name: string; phone?: string };
}

export default function AlertsManagementPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [actionAlert, setActionAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      let url = `/api/hospital/alerts?status=${statusFilter}`;
      if (severityFilter !== 'ALL') url += `&severity=${severityFilter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Use interval to poll if looking at active alerts
    if (statusFilter === 'ACTIVE') {
      const interval = setInterval(fetchAlerts, 15000);
      return () => clearInterval(interval);
    }
  }, [statusFilter, severityFilter]);

  const filteredAlerts = alerts.filter(a => 
    a.patient.name.toLowerCase().includes(search.toLowerCase()) ||
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Alerts Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor, acknowledge, and resolve patient alerts.</p>
        </div>
        <button onClick={fetchAlerts} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-grow">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by patient name or alert title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="ACTIVE">Active (Unresolved)</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ALL">All Statuses</option>
            </select>

            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Severity</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Alert</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Patient</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Time / Status</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="animate-pulse space-y-4 max-w-lg mx-auto">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <CheckCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  No alerts match your current filters.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => {
                const isResolved = !!alert.resolvedAt;
                const isAcknowledged = !!alert.acknowledgedAt;

                return (
                  <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{alert.title}</div>
                      <div className="text-gray-500 mt-1 line-clamp-2 max-w-sm" title={alert.message}>{alert.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/hospital/dashboard/opd/triage?patientId=${alert.patientId}`} 
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {alert.patient.name}
                      </Link>
                      <div className="text-gray-500 text-xs mt-1">{alert.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-900 font-medium">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-1">
                        {isResolved ? (
                          <span className="text-green-600 font-medium text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Resolved
                          </span>
                        ) : isAcknowledged ? (
                          <span className="text-blue-600 font-medium text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Acknowledged
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-xs animate-pulse flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!isResolved && (
                        <button 
                          onClick={() => setActionAlert(alert)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium text-xs"
                        >
                          Action
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {actionAlert && (
        <AlertActionModal
          alert={{
            id: actionAlert.id,
            title: actionAlert.title,
            message: actionAlert.message,
            status: actionAlert.acknowledgedAt ? 'ACKNOWLEDGED' : 'ACTIVE'
          }}
          onClose={() => setActionAlert(null)}
          onSuccess={() => {
            setActionAlert(null);
            fetchAlerts();
          }}
        />
      )}
    </div>
  );
}
