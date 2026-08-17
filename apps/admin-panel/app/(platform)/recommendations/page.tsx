import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function RecommendationsPage() {
  const recommendations = await prisma.platformRecommendation.findMany({
    where: { isDismissed: false },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendation Engine</h1>
          <p className="text-muted-foreground">
            Actionable platform insights and operational suggestions.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                  <span className="text-xs font-mono text-indigo-600">
                    {rec.hospitalId || 'Platform'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rec.createdAt.toLocaleString()}
                  </span>
                </div>
                <div className="font-medium">{rec.message}</div>
              </div>
              <div className="flex space-x-2">
                {rec.actionUrl && <Button size="sm">Take Action</Button>}
                <Button variant="outline" size="sm">
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No new recommendations.</div>
          )}
        </div>
      </div>
    </div>
  );
}
