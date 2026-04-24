/**
 * Label generation for EventLog display.
 * Produces human-readable summaries server-side (never expose raw metadata to client).
 */

type EventMeta = Record<string, any>;

const LABEL_GENERATORS: Record<string, (m: EventMeta) => string> = {
    patient_discharged: (m) =>
        `${m.patientName || 'Patient'} discharged — ${m.wardName || 'Ward'}`,

    followup_created: (m) =>
        `Auto follow-up scheduled — ${m.patientName || 'Patient'} (${m.pathwayLabel || m.carePathway || 'General'})`,

    bill_paid: (m) =>
        `₹${formatINR(m.amount)} received — ${m.patientName || 'Patient'} (${m.paymentMode || 'Cash'})`,

    notification_sent: (m) =>
        m.patientName
            ? `${m.channel || 'WhatsApp'} reminder sent — ${m.patientName}`
            : `${m.channel || 'WhatsApp'} reminder sent — ${m.count || 1} patients`,

    patient_admitted: (m) =>
        `${m.patientName || 'Patient'} admitted — ${m.wardName || 'Ward'} Bed ${m.bedNo || '?'}`,

    doctor_prescribes: (m) =>
        `Dr. ${m.doctorName || 'Doctor'} — ${m.count || 1} prescriptions completed`,

    patient_registered: (m) =>
        `New patient registered — ${m.patientName || 'Patient'}`,

    patient_visited: (m) =>
        `OPD visit recorded — ${m.patientName || 'Patient'}`,

    hospital_activated: (m) =>
        `Hospital setup completed`,

    followup_completed: (m) =>
        `Follow-up completed — ${m.patientName || 'Patient'}`,

    followup_missed: (m) =>
        `Follow-up missed — ${m.patientName || 'Patient'}`,
};

export function generateEventLabel(eventType: string, metadata: EventMeta): string {
    const gen = LABEL_GENERATORS[eventType];
    if (gen) {
        try { return gen(metadata); } catch { /* fall through */ }
    }
    // Fallback: humanise event_type
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatINR(paise: number | string | undefined): string {
    if (!paise) return '0';
    const num = typeof paise === 'string' ? parseInt(paise, 10) : paise;
    // If value looks like it's already in rupees (> 100), format as-is
    // Otherwise assume paise
    const rupees = num > 10000 ? num / 100 : num;
    return rupees.toLocaleString('en-IN');
}

export function formatTimeLabel(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDueDateLabel(dueDate: Date | string): { label: string; urgency: 'urgent' | 'soon' | 'scheduled' | 'missed' } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffMs = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'MISSED', urgency: 'missed' };
    if (diffDays === 0) return { label: 'Today', urgency: 'urgent' };
    if (diffDays === 1) return { label: 'Tomorrow', urgency: 'soon' };
    if (diffDays <= 2) return { label: `In ${diffDays} days`, urgency: 'soon' };

    return {
        label: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        urgency: 'scheduled'
    };
}
