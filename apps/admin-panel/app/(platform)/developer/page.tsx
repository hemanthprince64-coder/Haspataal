import { Button } from '@haspataal/ui/button';

import React from 'react';

export default function DeveloperPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">
            API Documentation, Webhook Tester, and SDK Downloads.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Download SDKs</Button>
          <Button>View API Docs</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Integration Endpoints</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 text-green-800">
                GET
              </span>
              <span className="text-sm font-mono text-muted-foreground">/api/v1/patients</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800">
                POST
              </span>
              <span className="text-sm font-mono text-muted-foreground">/api/v1/appointments</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-yellow-100 text-yellow-800">
                PUT
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                /api/v1/billing/invoices
              </span>
            </div>
            <div className="mt-4 text-sm text-indigo-600 font-medium cursor-pointer">
              Explore all endpoints →
            </div>
          </div>
        </div>

        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Webhook Tester</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Simulate events and inspect webhook payloads to test your integrations.
            </p>
            <div className="bg-slate-50 p-4 rounded-md border font-mono text-xs overflow-auto">
              {`{
  "event": "appointment.created",
  "data": {
    "id": "apt_123",
    "patientId": "pat_456",
    "time": "2023-11-20T10:00:00Z"
  }
}`}
            </div>
            <Button className="w-full" variant="outline">
              Test Payload
            </Button>
          </div>
        </div>

        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Quick Starts</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <div className="font-medium text-sm">Node.js SDK</div>
              <div className="text-xs text-muted-foreground mt-1">
                npm install @haspataal/client
              </div>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <div className="font-medium text-sm">Python SDK</div>
              <div className="text-xs text-muted-foreground mt-1">pip install haspataal-sdk</div>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <div className="font-medium text-sm">Go SDK</div>
              <div className="text-xs text-muted-foreground mt-1">
                go get github.com/haspataal/go-sdk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
