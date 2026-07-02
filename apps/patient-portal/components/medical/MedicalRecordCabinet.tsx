import { FileText, ImageIcon, File, Download, ExternalLink } from 'lucide-react';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Attachment {
  id: string;
  url: string;
  filename: string;
  type: string;
  size?: number;
  uploadedAt: string;
}

interface MedicalRecordCabinetProps {
  patientId: string;
  attachments?: Attachment[];
}

export function MedicalRecordCabinet({ patientId, attachments }: MedicalRecordCabinetProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return ImageIcon;
    return File;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const renderPreview = (attachment: Attachment) => {
    const isPdf = attachment.type.includes('pdf');
    const isImage = attachment.type.includes('image');

    if (isPdf) {
      return (
        <iframe
          src={attachment.url}
          className="w-full h-96 border rounded"
          title={attachment.filename}
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-w-full max-h-96 object-contain mx-auto"
        />
      );
    }

    return (
      <div className="p-8 text-center">
        <File className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-600">Preview not available for this file type.</p>
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
        >
          <ExternalLink className="w-4 h-4" /> Open file
        </a>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Medical Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!attachments || attachments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No attachments found.</p>
          ) : (
            <div className="grid gap-2">
              {attachments.map((a) => {
                const Icon = getFileIcon(a.type);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedAttachment(a)}
                  >
                    <Icon className="w-8 h-8 text-slate-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.filename}</p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(a.size)} • {new Date(a.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {a.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAttachment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedAttachment.filename}</span>
              <a
                href={selectedAttachment.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Download className="w-4 h-4" /> Download
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent>{renderPreview(selectedAttachment)}</CardContent>
        </Card>
      )}
    </div>
  );
}
