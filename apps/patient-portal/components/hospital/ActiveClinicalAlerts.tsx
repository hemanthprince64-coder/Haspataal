'use client';

import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle2 } from 'lucide-react';

import { useState, useEffect } from 'react';

interface ClinicalAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  source: string;
  createdAt: string;
  patient: {
    name: string;
    phone?: string;
  };
}

export default function ActiveClinicalAlerts({
  hospitalId = '',
  autoRefreshMs = 30000,
}: {
  hospitalId?: string;
  autoRefreshMs?: number;
}) {
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/clinical/alerts'); // Calls HMS backend endpoint
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAlerts(data.alerts || []);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    if (autoRefreshMs > 0) {
      const interval = setInterval(fetchAlerts, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [hospitalId, autoRefreshMs]);

  const handleAcknowledge = async (id: string) => {
    try {
      setAcknowledgingId(id);
      const res = await fetch(`/api/clinical/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Acknowledged from dashboard' }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert', error);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-500 text-red-900 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse';
      case 'HIGH':
        return 'bg-orange-50 border-orange-500 text-orange-900';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-400 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-400 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-gray-500">
        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
        <h3 className="font-semibold text-gray-700">No Active Alerts</h3>
        <p className="text-sm">All clinical parameters are within limits.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h3 className="font-bold text-slate-900">Active Clinical Alerts</h3>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </div>
        <button
          onClick={fetchAlerts}
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Refresh
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-r-lg p-4 flex gap-3 ${getSeverityStyle(alert.severity)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(alert.severity)}</div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{alert.title}</h4>
                <span className="text-[10px] font-semibold bg-white/50 px-1.5 py-0.5 rounded">
                  {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000)} min ago
                </span>
              </div>
              <p className="text-sm mt-1">{alert.message}</p>
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs font-medium opacity-80">
                  {alert.patient.name} {alert.patient.phone ? `(${alert.patient.phone})` : ''}
                  {alert.source && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-black/5">
                      Source: {alert.source}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={acknowledgingId === alert.id}
                  className="text-xs font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded transition-colors"
                >
                  {acknowledgingId === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
