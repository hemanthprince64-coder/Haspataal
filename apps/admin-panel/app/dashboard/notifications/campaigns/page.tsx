'use client';
import { useState } from 'react';

export default function CampaignBuilder() {
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = async () => {
    await fetch('/api/notifications/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        audience: JSON.parse(audience),
        scheduledAt: new Date(scheduledAt),
      }),
    });
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-bold mb-4">Campaign Builder</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Campaign Name"
        className="border p-2 rounded w-full mb-3"
      />
      <textarea
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        placeholder='{ "department": "cardiology" }'
        className="border p-2 rounded w-full mb-3"
        rows={4}
      />
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
        Launch Campaign
      </button>
    </div>
  );
}
