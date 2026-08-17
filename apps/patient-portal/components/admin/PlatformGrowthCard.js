import { TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export default function PlatformGrowthCard() {
  return (
    <Card className="bg-slate-900/40 border border-slate-800/80 w-full min-h-[300px] flex items-center justify-center relative overflow-hidden">
      {/* Background pattern grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <CardContent className="p-8 text-center space-y-4 max-w-md relative z-10">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-md">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Analytics Engine Coming Soon
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Revenue split operations, visiting consultant payout logs, and investor growth metrics
            dashboards will populate here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
