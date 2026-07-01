'use client';
import { useState, useEffect } from 'react';

export default function JourneyBuilder() {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/journeys/templates')
      .then((r) => r.json())
      .then((d) => setTemplates(d.data || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Journey Builder</h1>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Journey</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Import Template</button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded">Templates</button>
      </div>

      <div className="border rounded">
        {templates.map((t: any) => (
          <div key={t.id} className="p-3 border-b">
            <h3 className="font-semibold">{t.name}</h3>
            <p className="text-sm text-gray-600">{t.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
