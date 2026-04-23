import React, { useState } from 'react';
import { UploadCloud, File, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
  hospitalId: string;
  docType: string;
  label: string;
  rejectionReason?: string;
  onUploadSuccess: (url: string) => void;
}

export function DocumentUpload({ hospitalId, docType, label, rejectionReason, onUploadSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    // Simulate API call to POST /hospitals/:id/documents
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      // const res = await fetch(`/api/hospitals/${hospitalId}/documents`, { method: 'POST', body: formData });
      // const data = await res.json();
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock network
      onUploadSuccess(`mock_url_${file.name}`);
      setFile(null);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 relative">
      {rejectionReason && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 p-2 text-red-600 text-xs font-medium flex items-center justify-center gap-2 rounded-t-lg border-b border-red-200">
          <AlertTriangle className="w-4 h-4" />
          Rejected: {rejectionReason} - Please re-upload
        </div>
      )}

      <UploadCloud className={`w-8 h-8 text-slate-400 mb-3 ${rejectionReason ? 'mt-6' : ''}`} />
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-xs text-slate-500 mb-4">PDF, JPG, PNG up to 10MB</span>
      
      {!file ? (
        <label className="cursor-pointer">
          <span className="bg-white border border-slate-200 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-slate-50 transition-colors">
            Select File
          </span>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="flex items-center gap-3 w-full max-w-xs bg-white p-2 rounded-md border border-slate-200 shadow-sm">
          <File className="w-5 h-5 text-blue-500" />
          <span className="text-sm truncate flex-1">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && (
        <Button 
          className="mt-4 w-full max-w-xs" 
          onClick={handleUpload} 
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Confirm Upload'}
        </Button>
      )}
    </div>
  );
}
