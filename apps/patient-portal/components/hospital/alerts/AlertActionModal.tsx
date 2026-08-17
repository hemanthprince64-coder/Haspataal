'use client';

import { useState } from 'react';
import { X, CheckCircle2, CheckSquare } from 'lucide-react';

interface AlertActionModalProps {
  alert: {
    id: string;
    title: string;
    message: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AlertActionModal({ alert, onClose, onSuccess }: AlertActionModalProps) {
  const [action, setAction] = useState<'ACKNOWLEDGE' | 'RESOLVE'>(
    alert.status === 'ACTIVE' ? 'ACKNOWLEDGE' : 'RESOLVE'
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'RESOLVE' && !note.trim()) {
      setError('Resolution note is mandatory');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = action === 'ACKNOWLEDGE' 
        ? `/api/hospital/alerts/${alert.id}/acknowledge`
        : `/api/hospital/alerts/${alert.id}/resolve`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update alert');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Action Alert</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-gray-100">
          <h4 className="font-semibold text-sm text-gray-900">{alert.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-4">
            {alert.status === 'ACTIVE' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="action"
                  checked={action === 'ACKNOWLEDGE'}
                  onChange={() => setAction('ACKNOWLEDGE')}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">Acknowledge</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="action"
                checked={action === 'RESOLVE'}
                onChange={() => setAction('RESOLVE')}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Resolve</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Note {action === 'RESOLVE' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={3}
              placeholder={action === 'RESOLVE' ? 'Enter reason for resolution...' : 'Optional acknowledgment note...'}
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Processing...' : (action === 'ACKNOWLEDGE' ? <CheckSquare className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />)}
              {action === 'ACKNOWLEDGE' ? 'Acknowledge Alert' : 'Resolve Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
