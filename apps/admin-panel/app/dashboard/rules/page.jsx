'use client';

import { useState, useEffect } from 'react';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules', {
        headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id) => {
    await fetch(`/api/rules/${id}/toggle`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchRules();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rules Engine</h2>
        <button
          onClick={() => {
            setSelectedRule(null);
            setShowEditor(true);
          }}
          className="btn btn-primary"
        >
          Create Rule
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2">Name</th>
              <th className="text-left pb-2">Category</th>
              <th className="text-left pb-2">Trigger</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-left pb-2">Priority</th>
              <th className="text-left pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b">
                <td className="py-2">{rule.name}</td>
                <td className="py-2">{rule.category}</td>
                <td className="py-2">{rule.triggerEvent || rule.triggerType}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2">{rule.priority}</td>
                <td className="py-2">
                  <button
                    onClick={() => {
                      setSelectedRule(rule);
                      setShowEditor(true);
                    }}
                    className="text-sm text-blue-600 mr-2"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleToggle(rule.id)} className="text-sm text-gray-600">
                    {rule.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
