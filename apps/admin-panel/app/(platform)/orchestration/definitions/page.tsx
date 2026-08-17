import React from 'react';

export default function DefinitionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Definitions</h1>
      <p className="text-muted-foreground">Visual representations of all registered workflows.</p>
      <div className="p-6 border rounded-xl shadow bg-card text-card-foreground">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          [Placeholder for Interactive Workflow Graph (e.g. React Flow)]
        </div>
      </div>
    </div>
  );
}
