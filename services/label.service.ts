/**
 * Label generation for EventLog display.
 * Produces human-readable summaries server-side (never expose raw metadata to client).
 */

type EventMeta = Record<string, any>;

const LABEL_GENERATORS: Record<string, (m: EventMeta) => string> = {
    // ─── Patient events ──────────────────────────────────────────────
    patient_discharged: (m) =>
        `${m.patientName || 'Patient'} discharged — ${m.wardName || 'Ward'}`,

    patient_admitted: (m) =>
        `${m.patientName || 'Patient'} admitted — ${m.wardName || 'Ward'} Bed ${m.bedNo || '?'}`,

    patient_registered: (m) =>
        `New patient registered — ${m.patientName || 'Patient'}`,

    patient_visited: (m) =>
        `OPD visit recorded — ${m.patientName || 'Patient'}`,

    patient_created: (m) =>
        `Patient created — ${m.patientName || 'Patient'}`,

    // ─── Visit / Billing events ──────────────────────────────────────
    visit_completed: (m) =>
        `Visit completed — ${m.patientName || 'Patient'} (${m.diagnosis || 'OPD'})`,

    bill_paid: (m) =>
        `₹${formatINR(m.amount)} received — ${m.patientName || 'Patient'} (${m.paymentMode || 'Cash'})`,

    bill_generated: (m) =>
        `Bill ₹${formatINR(m.amount)} generated — ${m.patientName || 'Patient'}`,

    // ─── Follow-up events ────────────────────────────────────────────
    followup_created: (m) =>
        `Auto follow-up scheduled — ${m.patientName || 'Patient'} (${m.pathwayLabel || m.carePathway || 'General'})`,

    followup_completed: (m) =>
        `Follow-up completed — ${m.patientName || 'Patient'}`,

    followup_missed: (m) =>
        `Follow-up missed — ${m.patientName || 'Patient'}`,

    // ─── Notification / Reminder events ──────────────────────────────
    notification_sent: (m) =>
        m.patientName
            ? `${m.channel || 'WhatsApp'} sent — ${m.patientName}`
            : `${m.channel || 'WhatsApp'} sent — ${m.count || 1} patients`,

    notification_delivered: (m) =>
        `Notification delivered — ${m.patientName || 'Patient'}`,

    notification_queued: (m) =>
        `Notification queued — ${m.channel || 'System'}`,

    reminder_sent: (m) =>
        `${(m.channel || 'WhatsApp').charAt(0).toUpperCase() + (m.channel || 'whatsapp').slice(1)} reminder sent via dashboard`,

    // ─── Appointment & Scheduling ────────────────────────────────────
    APPOINTMENT_BOOKED: (m) =>
        `Appointment confirmed — ${m.patientName || 'Patient'} with Dr. ${m.doctorName || 'Doctor'}`,

    // ─── Lab & Diagnostics ───────────────────────────────────────────
    lab_result_ready: (m) =>
        `Lab results ready — ${m.testName || 'Diagnostic Report'}`,

    // ─── Pharmacy ─────────────────────────────────────────────────────
    medicine_dispensed: (m) =>
        `Medicine dispensed — ${m.medicineName || 'Medication'}`,

    // ─── Onboarding & Migration ──────────────────────────────────────
    partial_setup_saved: (m) =>
        `Onboarding step ${m.step || '?'} saved`,

    data_imported: (m) =>
        `Data import complete — ${m.row_count || 0} rows from ${m.source_type || 'unknown'}`,

    // ─── Chronic Care Escalation ─────────────────────────────────────
    chronic_escalation_alert: (m) =>
        `Chronic escalation alert — ${m.patientName || 'Patient'}`,

    // ─── Document Management ─────────────────────────────────────────
    document_expiring_soon: (m) =>
        `Document expiring soon — ${m.documentName || 'Document'}`,

    // ─── Doctor events ───────────────────────────────────────────────
    doctor_prescribes: (m) =>
        `Dr. ${m.doctorName || 'Doctor'} — ${m.count || 1} prescriptions completed`,

    doctor_registered: (m) =>
        `New doctor registered — ${m.doctorName || 'Doctor'}`,

    doctor_added: (m) =>
        `Doctor added to hospital — ${m.doctorName || 'Doctor'}`,

    doctor_removed: (m) =>
        `Doctor removed from hospital`,

    doctor_approved: (m) =>
        `Doctor affiliation approved — ${m.doctorName || 'Doctor'}`,

    doctor_rejected: (m) =>
        `Doctor affiliation rejected — ${m.doctorName || 'Doctor'}`,

    // ─── Hospital events ─────────────────────────────────────────────
    hospital_registered: (m) =>
        `Hospital registered — ${m.hospitalName || 'Hospital'}`,

    hospital_verified: (m) =>
        `Hospital verified — ${m.hospitalName || 'Hospital'}`,

    hospital_activated: () =>
        `Hospital setup completed`,

    hospital_approved: (m) =>
        `Hospital approved — ${m.hospitalName || 'Hospital'}`,

    hospital_rejected: (m) =>
        `Hospital rejected — ${m.hospitalName || 'Hospital'}`,

    hospital_suspended: (m) =>
        `Hospital suspended — ${m.hospitalName || 'Hospital'}`,

    // ─── Other events ────────────────────────────────────────────────
    lab_registered: (m) =>
        `Diagnostic lab registered — ${m.labName || 'Lab'}`,

    agent_registered: (m) =>
        `New agent registered — ${m.agentName || 'Agent'}`,
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
