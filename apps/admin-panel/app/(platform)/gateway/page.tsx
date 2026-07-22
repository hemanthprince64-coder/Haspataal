/* eslint-disable */
import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function ApiGatewayPage() {
  // TODO: Implement API keys in prisma schema
  const apiKeys: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Gateway</h1>
          <p className="text-muted-foreground">Manage API keys, scopes, and integration quotas.</p>
        </div>
        <Button>Generate API Key</Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Active API Keys</h3>
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Hospital</th>
              <th className="py-3 px-4 font-medium">Prefix</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Last Used</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key: any) => (
              <tr key={key.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{key.name}</td>
                <td className="py-3 px-4">{key.hospital.legalName}</td>
                <td className="py-3 px-4 font-mono text-xs">{key.prefix}••••</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      key.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {key.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {key.lastUsedAt ? key.lastUsedAt.toLocaleString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
            {apiKeys.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No API Keys generated.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
