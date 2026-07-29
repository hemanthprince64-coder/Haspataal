'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Info, Clock, CheckCircle, Bell } from 'lucide-react';
import AlertActionModal from './AlertActionModal';

interface TimelineItem {
  id: string;
  _type: 'EVENT' | 'ALERT';
  createdAt: string;
  // Event specific
  eventType?: string;
  payload?: any;
  // Alert specific
  severity?: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  title?: string;
  message?: string;
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  resolvedAt?: string | null;
  acknowledgedAt?: string | null;
  ackNote?: string | null;
  source?: string;
}

export default function AlertTimeline({ patientId }: { patientId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<TimelineItem | null>(null);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/hospital/alerts/timeline?patientId=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.timeline || []);
      }
    } catch (e) {
      console.error('Failed to fetch timeline', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  if (loading) return <div className="animate-pulse p-4 bg-gray-50 rounded-xl h-40">Loading timeline...</div>;

  if (items.length === 0) return (
    <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center">
      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-600">No clinical events or alerts recorded.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" /> Clinical Timeline
      </h3>

      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {items.map((item, idx) => {
          const isAlert = item._type === 'ALERT';
          const isResolved = isAlert && !!item.resolvedAt;
          
          return (
            <div key={item.id + idx} className="relative pl-6">
              {/* Timeline dot */}
              <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                isAlert 
                  ? item.severity === 'CRITICAL' ? 'bg-red-500' 
                    : item.severity === 'HIGH' ? 'bg-orange-500' 
                    : item.severity === 'WARNING' ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                  : 'bg-gray-300'
              }`}></div>

              <div className={`rounded-lg p-3 border ${
                isAlert 
                  ? item.severity === 'CRITICAL' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {isAlert ? <Bell className="h-4 w-4 text-red-500" /> : <Info className="h-4 w-4 text-gray-500" />}
                    <h4 className="font-semibold text-sm text-gray-900">
                      {isAlert ? item.title : item.eventType?.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mt-1">
                  {isAlert ? item.message : JSON.stringify(item.payload)}
                </p>

                {isAlert && (
                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2">
                    <div className="flex items-center gap-3 text-xs">
                      {isResolved ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </span>
                      ) : item.acknowledgedAt ? (
                        <span className="text-blue-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Acknowledged
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium animate-pulse">ACTIVE</span>
                      )}
                      
                      {item.ackNote && (
                        <span className="text-gray-500 italic">"{item.ackNote}"</span>
                      )}
                    </div>
                    
                    {!isResolved && (
                      <button 
                        onClick={() => setActionAlert(item)}
                        className="text-xs font-semibold bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50"
                      >
                        Action Alert
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {actionAlert && (
        <AlertActionModal
          alert={{
            id: actionAlert.id,
            title: actionAlert.title || '',
            message: actionAlert.message || '',
            status: actionAlert.acknowledgedAt ? 'ACKNOWLEDGED' : 'ACTIVE'
          }}
          onClose={() => setActionAlert(null)}
          onSuccess={() => {
            setActionAlert(null);
            fetchTimeline();
          }}
        />
      )}
    </div>
  );
}
