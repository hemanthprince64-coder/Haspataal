/**
 * MedChat AI — Zod Validation Schemas
 * ====================================
 * Input/output contracts for the triage engine.
 */

import { z } from 'zod';

// ── INPUT SCHEMA ───────────────────────────────────────────

export const MedChatInputSchema = z.object({
    age: z.coerce.number().min(0).max(150),
    gender: z.enum(['Male', 'Female', 'Other']),
    city: z.string().min(1).max(100),
    duration: z.enum([
        'less than 1 day',
        '1-3 days',
        '3-7 days',
        '1-2 weeks',
        '2-4 weeks',
        'more than 1 month',
    ]),
    symptoms: z.string().min(3).max(2000),
    fever: z.enum(['yes', 'no']),
    breathingDifficulty: z.enum(['yes', 'no']),
    seizure: z.enum(['yes', 'no']),
    consciousnessNormal: z.enum(['yes', 'no']),
});

// ── OUTPUT SCHEMA ──────────────────────────────────────────

export const MedChatOutputSchema = z.object({
    urgency_level: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE']),
    red_flag_detected: z.boolean(),
    recommended_speciality: z.string(),
    possible_categories: z.array(z.string()).min(1),
    clinical_summary_for_doctor: z.string().min(10),
    patient_advice: z.string().min(10),
    disclaimer: z.string(),
    toon_compressed_record: z.string().optional(),
    probable_differentials_hidden: z.array(z.string()).min(1),
    risk_score_internal: z.number().min(0).max(100),
});
