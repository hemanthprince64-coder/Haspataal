'use client';

import { useState } from 'react';

export default function SimulationPanel({ onClose, rule }) {
  const [testEvent, setTestEvent] = useState({
    eventType: rule?.triggerEvent || '',
    patientId: '',
    field1: '',
    field2: '',
    field3: '',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    setResult(null);

    const event = {
      eventType: testEvent.eventType,
      ...(testEvent.field1 && { field1: testEvent.field1 }),
      ...(testEvent.field2 && { field2: testEvent.field2 }),
      ...(testEvent.field3 && { field3: testEvent.field3 }),
    };

    try {
      const res = await fetch('/api/rules/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ruleId: rule.id,
          event,
          patientId: testEvent.patientId,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">Simulate Rule: {rule.name}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trigger Event</label>
            <input
              type="text"
              value={testEvent.eventType}
              onChange={(e) => setTestEvent({ ...testEvent, eventType: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              type="text"
              value={testEvent.patientId}
              onChange={(e) => setTestEvent({ ...testEvent, patientId: e.target.value })}
              className="w-full border rounded p-2"
              placeholder="UUID of test patient"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Test Values (Optional)</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Field 1 value"
                value={testEvent.field1}
                onChange={(e) => setTestEvent({ ...testEvent, field1: e.target.value })}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Field 2 value"
                value={testEvent.field2}
                onChange={(e) => setTestEvent({ ...testEvent, field2: e.target.value })}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Field 3 value"
                value={testEvent.field3}
                onChange={(e) => setTestEvent({ ...testEvent, field3: e.target.value })}
                className="border rounded p-2"
              />
            </div>
          </div>

          <button onClick={runSimulation} disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Running...' : 'Run Simulation'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Result:</h4>
              <pre className="text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <button onClick={onClose} className="btn btn-outline w-full mt-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
