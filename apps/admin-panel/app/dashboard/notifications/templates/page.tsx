'use client';
import { useState } from 'react';

export default function TemplateEditor() {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('SMS');

  const handleSubmit = async () => {
    await fetch('/api/notifications/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, body, channel }),
    });
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-bold mb-4">Template Editor</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template Name"
        className="border p-2 rounded w-full mb-3"
      />
      <select
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      >
        <option>SMS</option>
        <option>WHATSAPP</option>
        <option>EMAIL</option>
        <option>PUSH</option>
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Template body..."
        className="border p-2 rounded w-full mb-3"
        rows={6}
      />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Template
      </button>
    </div>
  );
}
