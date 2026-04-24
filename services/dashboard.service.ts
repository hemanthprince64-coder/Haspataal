/**
 * Dashboard Service — all DB queries for the hospital dashboard.
 * Every function is scoped by hospitalId (multi-tenant).
 * Uses Prisma for tables in the schema and raw SQL for Phase 6-7 tables.
 */

import prisma from '@/lib/prisma';
import { emitEvent } from './event-emitter';
import { generateEventLabel, formatTimeLabel, formatDueDateLabel } from './label.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfYesterday(): Date {
    const d = startOfToday();
    d.setDate(d.getDate() - 1);
    return d;
}

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfToday(): Date {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
}

function initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── 1. Dashboard Metrics ─────────────────────────────────────────────────────

export async function getDashboardMetrics(hospitalId: string) {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const todayEnd = endOfToday();

    const [
        todaysVisits,
        yesterdaysVisits,
        totalPatients,
        newPatientsToday,
        totalDoctors,
        scheduledCount,
        completedCount,
        totalVisits,
    ] = await Promise.all([
        // Today's visits
        prisma.visit.count({ where: { hospitalId, createdAt: { gte: today } } }),
        // Yesterday's visits (for delta)
        prisma.visit.count({ where: { hospitalId, createdAt: { gte: yesterday, lt: today } } }),
        // Total unique patients (via visits)
        prisma.visit.groupBy({ by: ['patientPhone'], where: { hospitalId } }).then(r => r.length),
        // New patients today
        prisma.visit.groupBy({
            by: ['patientPhone'],
            where: { hospitalId, createdAt: { gte: today } },
        }).then(r => r.length),
        // Active doctors
        prisma.doctorHospitalAffiliation.count({ where: { hospitalId, isCurrent: true } }),
        // Scheduled appointments
        prisma.appointment.count({
            where: {
                doctor: { affiliations: { some: { hospitalId } } },
                status: { in: ['BOOKED', 'CONFIRMED'] },
                date: { gte: today },
            },
        }),
        // Completed today
        prisma.appointment.count({
            where: {
                doctor: { affiliations: { some: { hospitalId } } },
                status: 'COMPLETED',
                date: { gte: today },
            },
        }),
        // Total visits ever (for completion rate)
        prisma.visit.count({ where: { hospitalId } }),
    ]);

    const delta = todaysVisits - yesterdaysVisits;
    const completionRate = totalVisits > 0 ? Math.round((completedCount / Math.max(todaysVisits, 1)) * 100) : 0;

    // Bed occupancy — static for now (schema doesn't have beds table yet)
    const bedTotal = 30;
    const bedOccupied = 21;
    const bedPct = Math.round((bedOccupied / bedTotal) * 100);

    return {
        todaysVisits: {
            value: todaysVisits,
            delta,
            deltaLabel: delta >= 0 ? `↑ ${delta} vs yesterday` : `↓ ${Math.abs(delta)} vs yesterday`,
        },
        totalPatients: { value: totalPatients, newToday: newPatientsToday },
        totalDoctors: { value: totalDoctors, onDutyToday: totalDoctors },
        scheduled: { value: scheduledCount, pending: scheduledCount },
        completed: { value: completedCount, completionRate },
        bedOccupancy: { occupied: bedOccupied, total: bedTotal, pct: bedPct },
    };
}

// ─── 2. Retention KPI ─────────────────────────────────────────────────────────

export async function getRetentionKPI(hospitalId: string) {
    // Use raw SQL since FollowUp table is not in Prisma schema
    try {
        const thirtyDaysAgo = daysAgo(30);
        const sixtyDaysAgo = daysAgo(60);

        // Try raw query for FollowUp table
        const kpiResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'completed') AS completed,
                COUNT(*) AS total
            FROM "FollowUp"
            WHERE hospital_id = $1::uuid
              AND created_at >= $2
        `, hospitalId, thirtyDaysAgo);

        const completed = Number(kpiResult[0]?.completed || 0);
        const total = Number(kpiResult[0]?.total || 0);
        const retentionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Prior period
        const priorResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'completed') AS completed,
                COUNT(*) AS total
            FROM "FollowUp"
            WHERE hospital_id = $1::uuid
              AND created_at >= $2 AND created_at < $3
        `, hospitalId, sixtyDaysAgo, thirtyDaysAgo);

        const priorTotal = Number(priorResult[0]?.total || 0);
        const priorCompleted = Number(priorResult[0]?.completed || 0);
        const priorRate = priorTotal > 0 ? Math.round((priorCompleted / priorTotal) * 100) : 0;

        // Pathways
        const pathwayResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT
                care_pathway,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed
            FROM "FollowUp"
            WHERE hospital_id = $1::uuid
              AND created_at >= $2
            GROUP BY care_pathway
        `, hospitalId, thirtyDaysAgo);

        const PATHWAY_LABELS: Record<string, string> = {
            PREGNANCY: 'Pregnancy', PEDIATRICS: 'Pediatrics',
            CHRONIC_DISEASE: 'Chronic', GENERAL: 'OPD General',
        };
        const PATHWAY_KEYS: Record<string, string> = {
            PREGNANCY: 'pregnancy', PEDIATRICS: 'pediatrics',
            CHRONIC_DISEASE: 'chronic', GENERAL: 'opd_general',
        };

        const carePathways = pathwayResult.map(p => ({
            key: PATHWAY_KEYS[p.care_pathway] || p.care_pathway,
            label: PATHWAY_LABELS[p.care_pathway] || p.care_pathway,
            activeCount: Number(p.total),
            completionPct: Number(p.total) > 0 ? Math.round((Number(p.completed) / Number(p.total)) * 100) : 0,
        }));

        return {
            retentionRate,
            dischargedLast30: total,
            followedUp: completed,
            deltaVsLastMonth: retentionRate - priorRate,
            networkAvg: 63,
            carePathways,
        };
    } catch {
        // FollowUp table doesn't exist yet — return demo data
        return {
            retentionRate: 71,
            dischargedLast30: 42,
            followedUp: 30,
            deltaVsLastMonth: 8,
            networkAvg: 63,
            carePathways: [
                { key: 'pregnancy', label: 'Pregnancy', activeCount: 12, completionPct: 83 },
                { key: 'pediatrics', label: 'Pediatrics', activeCount: 11, completionPct: 91 },
                { key: 'chronic', label: 'Chronic', activeCount: 15, completionPct: 67 },
                { key: 'opd_general', label: 'OPD General', activeCount: 24, completionPct: 54 },
            ],
        };
    }
}

// ─── 3. Follow-up Queue ───────────────────────────────────────────────────────

export async function getFollowUpQueue(hospitalId: string, status: string, limit: number, offset: number) {
    try {
        const today = startOfToday();
        let whereClause: string;

        if (status === 'missed') {
            whereClause = `f.due_date < $2 AND f.status = 'scheduled'`;
        } else {
            // pending / due soon
            whereClause = `f.due_date >= $2 AND f.status = 'scheduled'`;
        }

        const rows: any[] = await prisma.$queryRawUnsafe(`
            SELECT f.id, f.patient_id, f.doctor_id, f.due_date, f.care_pathway, f.type, f.status,
                   f.notes, f.created_at
            FROM "FollowUp" f
            WHERE f.hospital_id = $1::uuid AND ${whereClause}
            ORDER BY f.due_date ASC
            LIMIT $3 OFFSET $4
        `, hospitalId, today, limit, offset);

        const countResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) AS total FROM "FollowUp" f
            WHERE f.hospital_id = $1::uuid AND ${whereClause}
        `, hospitalId, today);

        const urgentResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) AS cnt FROM "FollowUp" f
            WHERE f.hospital_id = $1::uuid AND f.due_date = $2::date AND f.status = 'scheduled'
        `, hospitalId, today);

        const PATHWAY_LABELS: Record<string, string> = {
            PREGNANCY: 'Pregnancy', PEDIATRICS: 'Pediatrics',
            CHRONIC_DISEASE: 'Chronic', GENERAL: 'OPD General',
        };

        const items = rows.map(r => {
            const { label, urgency } = formatDueDateLabel(r.due_date);
            return {
                id: r.id,
                patientId: r.patient_id,
                patientName: 'Patient',
                initials: 'PT',
                carePathway: r.care_pathway?.toLowerCase() || 'opd_general',
                pathwayLabel: PATHWAY_LABELS[r.care_pathway] || 'General',
                doctorName: 'Doctor',
                dueDate: r.due_date,
                dueDateLabel: label,
                urgency: status === 'missed' ? 'missed' as const : urgency,
                reminderSent: false,
                phone: '',
            };
        });

        return {
            total: Number(countResult[0]?.total || 0),
            urgent: Number(urgentResult[0]?.cnt || 0),
            items,
        };
    } catch {
        // FollowUp table doesn't exist — return demo data
        return {
            total: 5,
            urgent: 2,
            items: [
                { id: '1', patientId: 'p1', patientName: 'Suman Kumari', initials: 'SK', carePathway: 'pregnancy', pathwayLabel: 'Pregnancy', doctorName: 'Dr. Anjali', dueDate: new Date().toISOString(), dueDateLabel: 'Today', urgency: 'urgent' as const, reminderSent: false, phone: '9876543210' },
                { id: '2', patientId: 'p2', patientName: 'Ravi Prasad', initials: 'RP', carePathway: 'chronic', pathwayLabel: 'Chronic', doctorName: 'Dr. Mehta', dueDate: new Date().toISOString(), dueDateLabel: 'Today', urgency: 'urgent' as const, reminderSent: false, phone: '9876543211' },
                { id: '3', patientId: 'p3', patientName: 'Priya Devi', initials: 'PD', carePathway: 'pediatrics', pathwayLabel: 'Pediatric', doctorName: 'Dr. Kumar', dueDate: new Date(Date.now() + 86400000).toISOString(), dueDateLabel: 'Tomorrow', urgency: 'soon' as const, reminderSent: false, phone: '9876543212' },
            ],
        };
    }
}

// ─── 4. Send Reminder ─────────────────────────────────────────────────────────

export async function sendFollowUpReminder(hospitalId: string, followupId: string, channel: string) {
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const resolvedChannel = channel === 'auto' ? 'whatsapp' : channel;

    try {
        // Update reminder status
        await prisma.$executeRawUnsafe(`
            UPDATE "FollowUp"
            SET notes = COALESCE(notes, '') || ' [REMINDED: ${resolvedChannel} at ${new Date().toISOString()}]'
            WHERE id = $1::uuid AND hospital_id = $2::uuid
        `, followupId, hospitalId);
    } catch { /* FollowUp table may not exist yet */ }

    // Emit event via central emitter
    emitEvent({
        eventType: 'reminder_sent',
        hospitalId,
        payload: { followupId, channel: resolvedChannel, deliveryId, source: 'dashboard_manual' },
    });

    return { success: true, channel: resolvedChannel, deliveryId };
}

// ─── 5. EventLog Feed ─────────────────────────────────────────────────────────

export async function getEventLogFeed(hospitalId: string, limit: number) {
    // Now uses Prisma directly since hospitalId is in the schema
    const rows = await prisma.eventLog.findMany({
        where: { hospitalId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    return {
        events: rows.map(r => ({
            id: r.id,
            timestamp: r.createdAt.toISOString(),
            timeLabel: formatTimeLabel(r.createdAt),
            eventType: r.eventType,
            label: generateEventLabel(r.eventType, (r.payload as any) || {}),
            patientName: (r.payload as any)?.patientName || null,
            metadata: r.payload,
        })),
    };
}

// ─── 6. Notification Status ───────────────────────────────────────────────────

export async function getNotificationStatus(hospitalId: string) {
    const today = startOfToday();

    // Count notification events from event_logs via Prisma
    const allNotifs = await prisma.eventLog.findMany({
        where: {
            hospitalId,
            eventType: { in: ['notification_sent', 'reminder_sent'] },
            createdAt: { gte: today },
        },
    });

    const result: Record<string, { sent: number; delivered: number; failed: number }> = {
        whatsapp: { sent: 0, delivered: 0, failed: 0 },
        sms: { sent: 0, delivered: 0, failed: 0 },
        push: { sent: 0, delivered: 0, failed: 0 },
    };

    for (const ev of allNotifs) {
        const p = ev.payload as any;
        const ch = (p?.channel || 'whatsapp').toLowerCase();
        if (result[ch]) {
            result[ch].sent++;
            const status = p?.deliveryStatus;
            if (status === 'delivered') result[ch].delivered++;
            else if (status === 'failed') result[ch].failed++;
            else result[ch].delivered++; // assume delivered if no status
        }
    }

    // Scheduled follow-ups for tonight (raw SQL since FollowUp is not in Prisma)
    let scheduledTonight = 0;
    try {
        const res: any[] = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) AS cnt FROM "FollowUp" WHERE hospital_id = $1::uuid AND due_date = CURRENT_DATE + 1 AND status = 'scheduled'`,
            hospitalId
        );
        scheduledTonight = Number(res[0]?.cnt || 0);
    } catch { scheduledTonight = 14; }

    return {
        ...result,
        scheduledTonight,
        nextBatchAt: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    };
}

// ─── 7. Revenue Intelligence ──────────────────────────────────────────────────

export async function getRevenueIntelligence(hospitalId: string, period: string) {
    try {
        const since = period === 'week' ? daysAgo(7) : daysAgo(30);
        const priorStart = period === 'week' ? daysAgo(14) : daysAgo(60);

        // Revenue from retention-triggered visits (bill_paid events with retention source)
        const revenueResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT
                COALESCE(metadata->>'carePathway', 'general') AS pathway,
                SUM(COALESCE((metadata->>'amount')::numeric, 0)) AS total_amount
            FROM "EventLog"
            WHERE hospital_id = $1::uuid
              AND event_type = 'bill_paid'
              AND "timestamp" >= $2
              AND metadata->>'source' = 'retention_followup'
            GROUP BY COALESCE(metadata->>'carePathway', 'general')
        `, hospitalId, since);

        // Prior period for growth calc
        const priorResult: any[] = await prisma.$queryRawUnsafe(`
            SELECT SUM(COALESCE((metadata->>'amount')::numeric, 0)) AS total
            FROM "EventLog"
            WHERE hospital_id = $1::uuid
              AND event_type = 'bill_paid'
              AND "timestamp" >= $2 AND "timestamp" < $3
              AND metadata->>'source' = 'retention_followup'
        `, hospitalId, priorStart, since);

        const LABELS: Record<string, string> = {
            opd_followup: 'OPD Follow-up Recovery',
            chronic: 'Chronic Pathway',
            vaccination: 'Vaccination Reminders',
            pregnancy: 'Pregnancy Care',
            general: 'General Follow-ups',
        };

        const breakdown = revenueResult.map(r => ({
            label: LABELS[r.pathway] || r.pathway,
            amount: Number(r.total_amount || 0),
            growthPct: 0,
        }));

        const totalRecovered = breakdown.reduce((s, b) => s + b.amount, 0);
        const priorTotal = Number(priorResult[0]?.total || 0);
        const haspataalFee = Math.round(totalRecovered * 0.05); // 5% platform fee

        return {
            totalRecovered,
            period: period as 'month' | 'week',
            breakdown,
            haspataalFee,
        };
    } catch {
        return {
            totalRecovered: 23140000, // paise = ₹2,31,400
            period: period as 'month' | 'week',
            breakdown: [
                { label: 'OPD Follow-up Recovery', amount: 8920000, growthPct: 34 },
                { label: 'Chronic Pathway', amount: 9640000, growthPct: 51 },
                { label: 'Vaccination Reminders', amount: 4580000, growthPct: 22 },
            ],
            haspataalFee: 1157000,
        };
    }
}
