'use client';
import { useState, useEffect } from 'react';

export default function PatientJourneys() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/journeys')
      .then((r) => r.json())
      .then((d) => setJourneys(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Care Journeys</h1>
      {journeys.length === 0 && (
        <p className="text-gray-500">No active journeys. Your doctor will enroll you.</p>
      )}
      {journeys.map((j: any) => (
        <div key={j.id} className="border rounded p-4 mb-3">
          <h2 className="font-semibold">{j.template?.name}</h2>
          <p className="text-sm text-gray-600">Stage: {j.currentStage}</p>
          <div className="mt-2">
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 px-2 py-1 rounded">Active</span>
              <span className="text-xs">Risk Score: {j.riskScore?.toFixed(1) ?? 'N/A'}</span>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium">Upcoming Tasks</h3>
              {j.tasks
                ?.filter((t: any) => t.status === 'PENDING')
                .map((t: any) => (
                  <div key={t.id} className="text-sm pl-2">
                    • {t.name}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
