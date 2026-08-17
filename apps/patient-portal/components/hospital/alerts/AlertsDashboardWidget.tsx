'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell, Clock, CheckCircle } from 'lucide-react';
import AlertActionModal from './AlertActionModal';
import Link from 'next/link';

interface AlertSummary {
  critical: number;
  high: number;
  warning: number;
  info: number;
  active: number;
  acknowledged: number;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  createdAt: string;
  patientId: string;
  resolvedAt: string | null;
  acknowledgedAt: string | null;
  patient: { name: string; phone?: string };
}

export default function AlertsDashboardWidget() {
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<Alert | null>(null);

  const fetchData = async () => {
    try {
      const [sumRes, alertsRes] = await Promise.all([
        fetch('/api/hospital/alerts/summary'),
        fetch('/api/hospital/alerts?limit=5&status=ACTIVE'), // Only fetch active for widget
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
      }
      
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }
    } catch (e) {
      console.error('Failed to fetch alerts data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 15-second polling as requested
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 border-red-500 text-red-900';
      case 'HIGH': return 'bg-orange-50 border-orange-500 text-orange-900';
      case 'WARNING': return 'bg-yellow-50 border-yellow-400 text-yellow-900';
      default: return 'bg-blue-50 border-blue-400 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'WARNING': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 flex flex-col h-full">
      <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h3 className="font-bold text-slate-900">Clinical Alerts</h3>
        </div>
        <Link href="/hospital/dashboard/alerts" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          View All →
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 border-b border-gray-100">
        <div className="p-3 text-center border-r border-gray-100 bg-red-50/30">
          <div className="text-2xl font-bold text-red-600">{summary?.critical ?? '-'}</div>
          <div className="text-[10px] uppercase font-semibold text-gray-500 mt-1">Critical</div>
        </div>
        <div className="p-3 text-center border-r border-gray-100 bg-orange-50/30">
          <div className="text-2xl font-bold text-orange-600">{summary?.high ?? '-'}</div>
          <div className="text-[10px] uppercase font-semibold text-gray-500 mt-1">High</div>
        </div>
        <div className="p-3 text-center border-r border-gray-100 bg-yellow-50/30">
          <div className="text-2xl font-bold text-yellow-600">{summary?.warning ?? '-'}</div>
          <div className="text-[10px] uppercase font-semibold text-gray-500 mt-1">Warning</div>
        </div>
        <div className="p-3 text-center bg-green-50/30">
          <div className="text-2xl font-bold text-green-600">{summary?.acknowledged ?? '-'}</div>
          <div className="text-[10px] uppercase font-semibold text-gray-500 mt-1">Ack'd Today</div>
        </div>
      </div>

      <div className="p-4 flex-grow overflow-y-auto min-h-[300px]">
        {loading && alerts.length === 0 ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-700">No Active Alerts</h3>
            <p className="text-sm">All clinical parameters are within limits.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-r-lg p-3 flex gap-3 ${getSeverityStyle(alert.severity)}`}
              >
                <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm truncate pr-2">{alert.title}</h4>
                    <span className="text-[10px] font-semibold bg-white/50 px-1.5 py-0.5 rounded whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000)}m ago
                    </span>
                  </div>
                  <p className="text-xs mt-1 truncate opacity-90">{alert.message}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5">
                    <Link 
                      href={`/hospital/dashboard/opd/triage?patientId=${alert.patientId}`} 
                      className="text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                      {alert.patient.name}
                    </Link>
                    <button
                      onClick={() => setActionAlert(alert as any)}
                      className="text-xs font-bold bg-white/70 hover:bg-white px-3 py-1 rounded transition-colors shadow-sm"
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionAlert && (
        <AlertActionModal
          alert={{ ...actionAlert, status: actionAlert.acknowledgedAt ? 'ACKNOWLEDGED' : 'ACTIVE' }}
          onClose={() => setActionAlert(null)}
          onSuccess={() => {
            setActionAlert(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
