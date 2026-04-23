import React, { useState } from 'react';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function DocumentViewer({ hospitalId, docType, docUrl }: { hospitalId: string, docType: string, docUrl: string }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    // API Call to /api/admin/documents/approve
    // This will update DB and potentially trigger 'hospital_verified' if all docs are approved
    setStatus('approved');
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert('Provide a reason for rejection');
    // API Call to /api/admin/documents/reject
    setStatus('rejected');
  };

  return (
    <div className="flex h-[500px]">
      {/* Left side - Document Preview */}
      <div className="w-2/3 bg-slate-200 border-r border-slate-200 flex items-center justify-center p-4">
        {/* Mocking a PDF viewer */}
        <div className="w-full h-full bg-white shadow-sm border border-slate-300 flex flex-col items-center justify-center text-slate-400">
          <FileText className="w-16 h-16 mb-4 text-slate-300" />
          <p>Document Preview: {docUrl}</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="w-1/3 p-6 flex flex-col bg-white">
        <h3 className="font-semibold text-lg mb-4 capitalize">{docType} Document</h3>
        
        {status === 'pending' && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rejection Reason (if any)</label>
              <Textarea 
                placeholder="Blurry image, expired license, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleReject} 
                variant="destructive" 
                className="flex-1"
                disabled={!rejectionReason}
              >
                Reject
              </Button>
              <Button 
                onClick={handleApprove} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-lg mt-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Document Approved</span>
          </div>
        )}

        {status === 'rejected' && (
          <div className="flex flex-col gap-2 text-red-700 bg-red-50 p-4 rounded-lg mt-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Document Rejected</span>
            </div>
            <p className="text-sm mt-2 text-red-600">Reason: {rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
