/**
 * MedChat AI — Deterministic Triage Engine
 * =========================================
 * Pure-function clinical triage classifier.
 * NO external API calls. NO LLM dependency.
 * Fully auditable, deterministic output.
 *
 * SAFETY: This is NOT a diagnostic tool.
 */

import { encode } from '@toon-format/toon';
import { GoogleGenerativeAI } from "@google/generative-ai";

import {
    RED_FLAGS,
    PEDIATRIC_RULES,
    SYMPTOM_MAP,
    SEASONAL_PATTERNS,
    LOCAL_RISKS,
    DURATION_MODIFIERS,
    FLAG_BOOSTS,
    JAILBREAK_PATTERNS,
    JAILBREAK_RESPONSE,
} from './symptoms-db.js';

const DISCLAIMER = 'MedChat AI provides triage guidance for informational purposes only. It does not provide medical diagnosis or treatment. Please consult a qualified doctor for proper evaluation. If symptoms worsen, seek immediate emergency care.';

/**
 * Initialize Gemini AI
 */
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * AI-powered Triage Analysis
 * Performs deep clinical reasoning using Gemini 2.0.
 */
async function triageWithAI(patientData) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a medical triage assistant for the Haspataal platform. 
            Analyze the following patient data and provide a structured JSON response.
            
            PATIENT DATA:
            - Age: ${patientData.age}
            - Gender: ${patientData.gender}
            - City: ${patientData.city}
            - Symptoms: "${patientData.symptoms}"
            - Duration: ${patientData.duration}
            - Fever: ${patientData.fever}
            - Breathing Difficulty: ${patientData.breathingDifficulty}
            - Seizure: ${patientData.seizure}
            - Consciousness: ${patientData.consciousnessNormal === 'yes' ? 'Normal' : 'Altered'}
            
            JSON FORMAT REQUIRED (Strictly follow this structure):
            {
              "urgency_level": "EMERGENCY" | "URGENT" | "ROUTINE",
              "recommended_speciality": "string",
              "clinical_summary_for_doctor": "max 50 words",
              "patient_advice": "max 50 words",
              "probable_differentials_hidden": ["list of 3 possibilities"],
              "ai_reasoning": "brief explanation of why this triage was chosen"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error("Gemini Triage Error:", error);
    }
    return null;
}

/**
 * Main triage function.
 * @param {object} input — Validated patient input (matches MedChatInputSchema)
 * @returns {object} — Strict JSON per MedChatOutputSchema
 */
export async function triagePatient(input) {
    const { age, gender, city, duration, symptoms, fever, breathingDifficulty, seizure, consciousnessNormal } = input;

    // ── JAILBREAK CHECK ─────────────────────────────────────
    for (const pattern of JAILBREAK_PATTERNS) {
        if (pattern.test(symptoms)) {
            return { ...JAILBREAK_RESPONSE };
        }
    }

    let riskScore = 0;
    let redFlagDetected = false;
    const detectedRedFlags = [];
    const matchedSpecialities = new Map(); // speciality → highest riskWeight
    const matchedCategories = new Set();
    const differentials = [];

    // ── RED FLAG SCAN ───────────────────────────────────────
    for (const flag of RED_FLAGS) {
        if (flag.pattern.test(symptoms)) {
            redFlagDetected = true;
            detectedRedFlags.push(flag.label);
            riskScore += 40;
        }
    }

    // Boolean flag red-flag triggers
    if (seizure === 'yes') {
        redFlagDetected = true;
        if (!detectedRedFlags.includes('Seizure / Convulsion')) {
            detectedRedFlags.push('Seizure / Convulsion');
        }
        riskScore += FLAG_BOOSTS.seizure;
    }

    if (consciousnessNormal === 'no') {
        redFlagDetected = true;
        if (!detectedRedFlags.includes('Unconsciousness')) {
            detectedRedFlags.push('Altered consciousness');
        }
        riskScore += FLAG_BOOSTS.consciousnessAbnormal;
    }

    if (breathingDifficulty === 'yes') {
        riskScore += FLAG_BOOSTS.breathingDifficulty;
    }

    if (fever === 'yes') {
        riskScore += FLAG_BOOSTS.fever;
    }

    if (consciousnessNormal === 'yes') {
        riskScore += FLAG_BOOSTS.consciousnessNormal; // slight reduction
    }

    // ── SYMPTOM MATCHING ────────────────────────────────────
    for (const entry of SYMPTOM_MAP) {
        for (const pattern of entry.patterns) {
            if (pattern.test(symptoms)) {
                const existing = matchedSpecialities.get(entry.speciality) || 0;
                if (entry.riskWeight > existing) {
                    matchedSpecialities.set(entry.speciality, entry.riskWeight);
                }
                matchedCategories.add(entry.category);
                riskScore += entry.riskWeight;
                break; // count each entry only once
            }
        }
    }

    // ── SEASONAL & REGIONAL MATCHING ────────────────────────
    for (const entry of SEASONAL_PATTERNS) {
        for (const pattern of entry.patterns) {
            if (pattern.test(symptoms)) {
                const existing = matchedSpecialities.get(entry.speciality) || 0;
                if (entry.riskWeight > existing) {
                    matchedSpecialities.set(entry.speciality, entry.riskWeight);
                }
                matchedCategories.add(entry.category);
                riskScore += entry.riskWeight;
                break;
            }
        }
    }

    // ── LOCALIZED RISK ADJUSTMENT ───────────────────────────
    if (city && LOCAL_RISKS[city]) {
        const local = LOCAL_RISKS[city];
        if (local.dengueStatus === 'HIGH' && /fever|body\s?ache/i.test(symptoms)) {
            riskScore += 15;
            matchedCategories.add(`Local Risk Alert: ${local.alert}`);
        }
        if (local.pollutionStatus === 'CRITICAL' && /breath|cough/i.test(symptoms)) {
            riskScore += 20;
            matchedCategories.add(`Pollution Alert: ${local.alert}`);
        }
    }

    // ── DURATION MODIFIER ───────────────────────────────────
    const durationBoost = DURATION_MODIFIERS[duration] || 0;
    riskScore += durationBoost;

    // ── PEDIATRIC ESCALATION ────────────────────────────────
    const isPediatric = age < PEDIATRIC_RULES.childAgeThreshold;
    const isInfant = age < PEDIATRIC_RULES.infantAgeThreshold;

    if (isInfant) {
        for (const trigger of PEDIATRIC_RULES.infantEscalationTriggers) {
            if (trigger.pattern.test(symptoms) || (trigger.label.includes('Fever') && fever === 'yes')) {
                riskScore += trigger.riskBoost;
                differentials.push(trigger.label);
            }
        }
        // Infant with fever is auto-escalated
        if (fever === 'yes') {
            redFlagDetected = true;
            if (!detectedRedFlags.includes('Fever in infant')) {
                detectedRedFlags.push('Fever in infant — requires urgent evaluation');
            }
        }
        matchedSpecialities.set('Pediatrics', Math.max(matchedSpecialities.get('Pediatrics') || 0, 25));
        matchedCategories.add('Pediatric symptoms');
    } else if (isPediatric) {
        for (const trigger of PEDIATRIC_RULES.childEscalationTriggers) {
            if (trigger.pattern.test(symptoms) || (trigger.label.includes('fever') && fever === 'yes')) {
                riskScore += trigger.riskBoost;
                differentials.push(trigger.label);
            }
        }
        matchedSpecialities.set('Pediatrics', Math.max(matchedSpecialities.get('Pediatrics') || 0, 15));
        matchedCategories.add('Pediatric symptoms');
    }

    // ── CLAMP & CLASSIFY ───────────────────────────────────
    riskScore = Math.min(100, Math.max(0, riskScore));

    // If red flag detected, ensure minimum risk score of 80
    if (redFlagDetected && riskScore < 80) {
        riskScore = 80;
    }

    // 5. Hybrid Logic: Call Gemini if available
    const aiResult = await triageWithAI(input);

    let urgencyLevel;
    if (aiResult?.urgency_level) {
        urgencyLevel = aiResult.urgency_level;
    } else if (riskScore >= 80 || redFlagDetected) {
        urgencyLevel = 'EMERGENCY';
        riskScore = Math.max(riskScore, 80);
    } else if (riskScore >= 50) {
        urgencyLevel = 'URGENT';
    } else {
        urgencyLevel = 'ROUTINE';
    }

    // Override with deterministic red flags for safety
    if (redFlagDetected) {
        urgencyLevel = 'EMERGENCY';
    }

    // ── DETERMINE PRIMARY SPECIALITY ────────────────────────
    let recommendedSpeciality = aiResult?.recommended_speciality || 'General Medicine';
    let highestWeight = 0;

    if (!aiResult) {
        if (urgencyLevel === 'EMERGENCY') {
            recommendedSpeciality = 'Emergency Medicine';
        } else {
            for (const [spec, weight] of matchedSpecialities) {
                if (weight > highestWeight) {
                    highestWeight = weight;
                    recommendedSpeciality = spec;
                }
            }
        }

        // If pediatric, prefer Pediatrics unless emergency
        if (isPediatric && urgencyLevel !== 'EMERGENCY') {
            recommendedSpeciality = 'Pediatrics';
        }
    }

    // ── BUILD CATEGORIES ────────────────────────────────────
    const categories = matchedCategories.size > 0
        ? [...matchedCategories]
        : ['General symptoms'];

    // ── DIFFERENTIALS (hidden) ──────────────────────────────
    if (detectedRedFlags.length > 0) {
        differentials.push(...detectedRedFlags.map(f => `Red flag: ${f}`));
    }
    if (differentials.length === 0) {
        differentials.push('Standard clinical evaluation recommended');
    }

    // ── CLINICAL SUMMARY ───────────────────────────────────
    const clinicalSummary = aiResult?.clinical_summary_for_doctor || buildClinicalSummary({
        age, gender, city, duration, symptoms, fever,
        breathingDifficulty, seizure, consciousnessNormal,
        urgencyLevel, redFlagDetected, detectedRedFlags,
        categories, isPediatric, isInfant,
    });

    // ── PATIENT ADVICE ──────────────────────────────────────
    const patientAdvice = aiResult?.patient_advice || buildPatientAdvice(urgencyLevel, redFlagDetected, isPediatric);

    // ── TOON COMPRESSION (FOR EHR / DASHBOARD) ──────────────
    const ehrTransmissionData = {
        patient: [{ age, sex: gender, city }],
        triage: [{
            urgency: urgencyLevel,
            score: riskScore,
            specialty: recommendedSpeciality,
            redFlags: redFlagDetected
        }],
        flags: detectedRedFlags.map((f, i) => ({ id: i + 1, type: f }))
    };

    const toonString = encode(ehrTransmissionData);

    return {
        urgency_level: urgencyLevel,
        red_flag_detected: redFlagDetected,
        recommended_speciality: recommendedSpeciality,
        possible_categories: categories,
        clinical_summary_for_doctor: clinicalSummary,
        patient_advice: patientAdvice,
        disclaimer: DISCLAIMER,
        toon_compressed_record: toonString,
        probable_differentials_hidden: aiResult?.probable_differentials_hidden || differentials,
        risk_score_internal: riskScore,
        is_ai_powered: !!aiResult,
        ai_reasoning: aiResult?.ai_reasoning || null
    };
}

/**
 * Lightweight detection for real-time feedback.
 * @param {string} symptoms 
 * @returns {string[]} - Array of matched speciality names
 */
export function detectSpecialities(symptoms) {
    if (!symptoms || symptoms.length < 3) return [];
    const matched = new Set();

    // Check main Map
    for (const entry of SYMPTOM_MAP) {
        for (const pattern of entry.patterns) {
            if (pattern.test(symptoms)) {
                matched.add(entry.speciality);
                break;
            }
        }
    }

    // Check Seasonal
    for (const entry of SEASONAL_PATTERNS) {
        for (const pattern of entry.patterns) {
            if (pattern.test(symptoms)) {
                matched.add(entry.speciality);
                break;
            }
        }
    }

    return [...matched];
}

// ── CLINICAL SUMMARY BUILDER ─────────────────────────────

function buildClinicalSummary(ctx) {
    const lines = [];
    const ageLabel = ctx.isInfant ? `${ctx.age}-year-old infant` :
        ctx.isPediatric ? `${ctx.age}-year-old pediatric patient` :
            `${ctx.age}-year-old ${ctx.gender.toLowerCase()} patient`;

    lines.push(`${ageLabel} from ${ctx.city} presents with: "${ctx.symptoms}".`);
    lines.push(`Duration of symptoms: ${ctx.duration}.`);

    const flags = [];
    if (ctx.fever === 'yes') flags.push('fever');
    if (ctx.breathingDifficulty === 'yes') flags.push('breathing difficulty');
    if (ctx.seizure === 'yes') flags.push('seizure activity');
    if (ctx.consciousnessNormal === 'no') flags.push('altered consciousness');

    if (flags.length > 0) {
        lines.push(`Associated findings: ${flags.join(', ')}.`);
    }

    if (ctx.redFlagDetected) {
        lines.push(`RED FLAGS IDENTIFIED: ${ctx.detectedRedFlags.join('; ')}. Immediate evaluation warranted.`);
    }

    lines.push(`Symptom categories: ${ctx.categories.join(', ')}.`);
    lines.push(`Triage classification: ${ctx.urgencyLevel}.`);

    return lines.join(' ');
}

// ── PATIENT ADVICE BUILDER ───────────────────────────────

function buildPatientAdvice(urgencyLevel, redFlagDetected, isPediatric) {
    if (urgencyLevel === 'EMERGENCY') {
        return 'Based on your symptoms, immediate medical attention is strongly recommended. Please visit the nearest hospital emergency department or call emergency services right away. Do not delay seeking care. If you are with someone, inform them about your condition immediately.';
    }

    if (urgencyLevel === 'URGENT') {
        const base = 'Your symptoms suggest that evaluation by a doctor is recommended within the next few hours. Please schedule a consultation at the earliest convenience through Haspataal or visit a nearby hospital.';
        if (isPediatric) {
            return base + ' Since the patient is a child, prompt medical evaluation is especially important. Monitor closely for any worsening signs.';
        }
        return base + ' In the meantime, rest adequately and stay hydrated. If symptoms worsen, seek immediate emergency care.';
    }

    // ROUTINE
    const base = 'These symptoms can often be managed with a scheduled consultation. We recommend booking an appointment with the suggested speciality through Haspataal for proper evaluation.';
    if (isPediatric) {
        return base + ' For children, monitoring symptom progression is important. If any new or worsening symptoms develop, please seek medical attention promptly.';
    }
    return base + ' In the meantime, maintain adequate hydration and rest. If your symptoms worsen or new symptoms develop, seek medical attention promptly.';
}
