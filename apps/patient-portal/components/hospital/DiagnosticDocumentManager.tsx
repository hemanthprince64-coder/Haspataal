/* eslint-disable */
'use client';

import {
  FileText,
  Image as ImageIcon,
  Upload,
  Pencil,
  Trash2,
  Download,
  X,
  Loader2,
  File,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useCallback, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DiagnosticDocument {
  id: string;
  orderId: string;
  resultId: string | null;
  documentType: 'BLOOD_REPORT' | 'IMAGING' | 'PATHOLOGY' | 'MICROBIOLOGY' | 'OTHER';
  description: string | null;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  result?: { id: string } | null;
}

interface ResultOption {
  id: string;
  label: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  BLOOD_REPORT: 'Blood Report',
  IMAGING: 'Imaging',
  PATHOLOGY: 'Pathology',
  MICROBIOLOGY: 'Microbiology',
  OTHER: 'Other',
};

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  BLOOD_REPORT: 'bg-rose-50 text-rose-700 border-rose-200',
  IMAGING: 'bg-blue-50 text-blue-700 border-blue-200',
  PATHOLOGY: 'bg-amber-50 text-amber-700 border-amber-200',
  MICROBIOLOGY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface DiagnosticDocumentManagerProps {
  orderId: string;
  results?: ResultOption[];
}

export default function DiagnosticDocumentManager({
  orderId,
  results = [],
}: DiagnosticDocumentManagerProps) {
  const [documents, setDocuments] = useState<DiagnosticDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('BLOOD_REPORT');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadResultId, setUploadResultId] = useState('');

  const [editDoc, setEditDoc] = useState<DiagnosticDocument | null>(null);
  const [editType, setEditType] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editResultId, setEditResultId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hospital/diagnostics/orders/${orderId}/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', uploadType);
      if (uploadDesc) formData.append('description', uploadDesc);
      if (uploadResultId) formData.append('resultId', uploadResultId);

      const res = await fetch(`/api/hospital/diagnostics/orders/${orderId}/documents`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      toast.success('Document uploaded');
      setUploadOpen(false);
      setFile(null);
      setUploadType('BLOOD_REPORT');
      setUploadDesc('');
      setUploadResultId('');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (doc: DiagnosticDocument) => {
    setEditDoc(doc);
    setEditType(doc.documentType);
    setEditDesc(doc.description || '');
    setEditResultId(doc.resultId || '');
  };

  const handleSaveEdit = async () => {
    if (!editDoc) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospital/diagnostics/documents/${editDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: editType,
          description: editDesc,
          resultId: editResultId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      toast.success('Document updated');
      setEditDoc(null);
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Not in scope for this story, placeholder
    toast.info('Delete not implemented in this iteration');
  };

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">Documents</h3>
          <p className="text-sm text-slate-500">Manage diagnostic reports and attachments</p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <File className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No documents yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Upload diagnostic reports, images, or scanned documents.
          </p>
          <Button
            onClick={() => setUploadOpen(true)}
            variant="outline"
            className="border-slate-200"
          >
            <Upload className="h-4 w-4 mr-2" /> Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden border-slate-200 rounded-xl">
              <div className="relative h-32 bg-slate-50 flex items-center justify-center">
                {isImage(doc.mimeType) ? (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                ) : (
                  <FileText className="h-10 w-10 text-slate-300" />
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`text-[10px] font-bold uppercase border ${DOCUMENT_TYPE_COLORS[doc.documentType] || ''}`}
                  >
                    {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">Document</p>
                    {doc.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <Paperclip className="h-3 w-3" />
                  <span>{formatBytes(doc.fileSizeBytes)}</span>
                  <span className="mx-1">|</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs border-slate-200"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(doc)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Upload Diagnostic Document</DialogTitle>
            <DialogDescription>
              Attach a report, image, or scanned document to this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">File</Label>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.dcm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-12"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Max 50 MB. PDF, PNG, JPEG, DICOM
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                Document Type
              </Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                Description (optional)
              </Label>
              <Textarea
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Add notes about this document"
                className="min-h-[80px] rounded-lg"
              />
            </div>
            {results.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Link to Result (optional)
                </Label>
                <Select value={uploadResultId} onValueChange={setUploadResultId}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select a result" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="">None</SelectItem>
                    {results.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document Details</DialogTitle>
            <DialogDescription>Update the metadata for this document.</DialogDescription>
          </DialogHeader>
          {editDoc && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Document Type
                </Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Description
                </Label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="min-h-[80px] rounded-lg"
                />
              </div>
              {results.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">
                    Link to Result
                  </Label>
                  <Select value={editResultId} onValueChange={setEditResultId}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select a result" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="">None</SelectItem>
                      {results.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDoc(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
