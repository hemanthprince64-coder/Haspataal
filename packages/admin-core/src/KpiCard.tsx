import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui/card';

import React from 'react';

export function KpiCard({
  title,
  value,
  icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isUpward: boolean };
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isUpward ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.isUpward ? '↑' : '↓'} {trend.value}% from last month
          </p>
        )}
        {description && !trend && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
