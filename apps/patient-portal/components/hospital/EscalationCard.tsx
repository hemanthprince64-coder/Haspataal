import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Siren, Clock, Phone, Hospital, User } from 'lucide-react';

export interface EscalationCardData {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorId: string;
  missedCount: number;
  chronicTag?: string;
  notificationSent: boolean;
  sentVia?: string;
  createdAt: Date;
}

interface EscalationCardProps {
  alert: EscalationCardData;
  onAcknowledge: (id: string) => void;
  isAcknowledging?: boolean;
}

function ChronicBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  const colors: Record<string, string> = {
    DIABETES:   'bg-amber-100 text-amber-800 border-amber-300',
    CANCER:     'bg-rose-100 text-rose-800 border-rose-300',
    CARDIAC:    'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <Badge variant="outline" className={colors[tag] || 'bg-slate-100 text-slate-700'}>
      {tag}
    </Badge>
  );
}

function SentBadge({ sentVia }: { sentVia?: string }) {
  if (!sentVia) return null;
  const label = sentVia === 'WHATSAPP' ? 'WhatsApp sent' : sentVia === 'SMS' ? 'SMS sent' : sentVia;
  return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">{label}</Badge>
  );
}

export default function EscalationCard({ alert, onAcknowledge, isAcknowledging }: EscalationCardProps) {
  const formattedDate = new Date(alert.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-600 animate-pulse" />
            <CardTitle className="text-base font-semibold text-slate-900">
              Escalation Alert
            </CardTitle>
            <ChronicBadge tag={alert.chronicTag} />
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Patient */}
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{alert.patientName || 'Unknown Patient'}</span>
          {alert.patientPhone && (
            <a href={`tel:${alert.patientPhone}`} className="text-blue-600 hover:underline flex items-center gap-1 ml-2">
              <Phone className="w-3.5 h-3.5" />{alert.patientPhone}
            </a>
          )}
        </div>

        {/* Doctor / Hospital */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Hospital className="w-3.5 h-3.5" />
            {alert.hospitalName || 'Hospital'}
          </span>
          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full font-medium">
            {alert.missedCount} missed follow-up{alert.missedCount > 1 ? 's' : ''}
          </span>
          <SentBadge sentVia={alert.sentVia} />
        </div>

        {/* Action */}
        <div className="pt-2 border-t">
          <Button
            size="sm"
            variant="default"
            onClick={() => onAcknowledge(alert.id)}
            disabled={isAcknowledging}
            className="w-full"
          >
            {isAcknowledging ? 'Acknowledging…' : 'Acknowledge & Resolve'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
