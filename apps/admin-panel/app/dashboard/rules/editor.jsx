'use client';

import { useState } from 'react';

export default function RuleEditor({ rule, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    category: rule?.category || 'CLINICAL',
    triggerType: rule?.triggerType || 'EVENT',
    triggerEvent: rule?.triggerEvent || '',
    isActive: rule?.isActive ?? true,
    priority: rule?.priority || 100,
    conditions: rule?.conditionJson || [{ field: '', operator: 'eq', value: '' }],
    actions: rule?.actionJson || [{ type: 'create_timeline', payload: {} }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/rules', {
      method: rule ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...formData,
        conditionJson: formData.conditions,
        actionJson: formData.actions,
      }),
    });
    if ((await res.json()).success) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{rule ? 'Edit Rule' : 'Create Rule'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded p-2"
            >
              <option value="CLINICAL">Clinical</option>
              <option value="BUSINESS">Business</option>
              <option value="NOTIFICATION">Notification</option>
              <option value="RETENTION">Retention</option>
              <option value="BILLING">Billing</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trigger Event</label>
            <input
              type="text"
              value={formData.triggerEvent}
              onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
              className="w-full border rounded p-2"
              placeholder="e.g., ANC_VISIT_COMPLETED, GLYCEMIC_READING"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conditions (JSON)</label>
            <textarea
              value={JSON.stringify(formData.conditions, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, conditions: JSON.parse(e.target.value) });
                } catch {}
              }}
              className="w-full border rounded p-2 h-32 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Actions (JSON)</label>
            <textarea
              value={JSON.stringify(formData.actions, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, actions: JSON.parse(e.target.value) });
                } catch {}
              }}
              className="w-full border rounded p-2 h-32 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary">
              {rule ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
