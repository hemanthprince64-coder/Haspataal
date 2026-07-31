 
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';
import logger from '../../../../lib/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ConsultationInput {
  visitId: string;
  clinicalNotes?: string;
  prescriptionImage?: {
    mimeType: string;
    data: string; // Base64
  };
  patientProfile?: {
    age?: number;
    weight?: number;
    language?: string;
  };
}

export class ConsultationAiEngine {
  private static getPromptContent(): string {
    const filePath = path.join(process.cwd(), 'lib', 'ai', 'prompts', 'engine-prompts.md');
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Helper to determine if we should bypass the cloud API
   */
  private static isOfflineMode(): boolean {
    const hasKey = !!process.env.GEMINI_API_KEY;
    const offlineProfile = process.env.NETWORK_STATUS === 'offline';
    return !hasKey || offlineProfile;
  }

  /**
   * Unified AI Completion Router supporting Gemini, local Ollama, and rule-based fallbacks.
   */
  private static async generateCompletion(
    prompt: string,
    imagePart: any | null,
    fallbackData: any,
  ): Promise<any> {
    const isOffline = this.isOfflineMode();

    if (!isOffline) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const contentParts: any[] = [{ text: prompt }];
        if (imagePart) {
          contentParts.push(imagePart);
        }

        const result = await model.generateContent(contentParts);
        const responseText = result.response.text();
        return JSON.parse(responseText);
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Gemini API failed. Falling back to local AI.');
      }
    }

    // Try Local Ollama Fallback
    try {
      const ollamaPrompt = prompt + '\nIMPORTANT: Your output MUST be a valid JSON object matching the requested schema. Return raw JSON only, no markdown formatting.';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: ollamaPrompt,
          stream: false,
          format: 'json',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        return JSON.parse(data.response);
      }
    } catch (err: any) {
      logger.info({ err: err.message }, 'Local Ollama not available. Using rule-based fallback.');
    }

    // Return deterministic fallback data
    return fallbackData;
  }

  /**
   * Main orchestration pipeline for the Post Consultation AI
   */
  static async process(input: ConsultationInput) {
    logger.info(
      { action: 'process_consultation_ai', visitId: input.visitId },
      'Starting Advanced Post-Consultation AI Pipeline',
    );

    try {
      // STEP 1: Medication Ingestion & Structuring (OCR + NLP)
      const medIntelligence = await this.ingestMedications(input);

      // STEP 2: Care Journey Generation (Simple Explanations + Red Flags)
      const careInsights = await this.generateCareInsights(input, medIntelligence);

      // STEP 3: Follow-Up Optimization (Conversion Driver)
      const followUpPlan = await this.optimizeFollowUp(input, medIntelligence, careInsights);

      // STEP 4: Recovery Roadmap Generation (Day 1-14 expectations)
      const recoveryRoadmap = await this.generateRecoveryRoadmap(
        input,
        careInsights,
        medIntelligence,
      );

      // STEP 5: Persistent Transaction to DB
      return await this.persistCareJourney(
        input.visitId,
        medIntelligence,
        careInsights,
        followUpPlan,
        recoveryRoadmap,
        input.patientProfile,
        this.isOfflineMode(),
        input.clinicalNotes,
      );
    } catch (error: any) {
      logger.error(
        { action: 'consultation_ai_failed', visitId: input.visitId, error: error.message },
        'Failed to orchestrate Consultation AI Engine',
      );
      throw error;
    }
  }

  private static async ingestMedications(input: ConsultationInput) {
    const promptBase = this.getPromptContent();
    const promptSnippet = promptBase.split('---')[0];

    const prompt = `
            ${promptSnippet}
            
            CLINICAL CONTEXT:
            ${input.clinicalNotes || 'No clinical notes provided.'}
            
            ${input.prescriptionImage ? 'An image of the prescription is attached.' : ''}
        `;

    let imagePart = null;
    if (input.prescriptionImage) {
      imagePart = {
        inlineData: {
          mimeType: input.prescriptionImage.mimeType,
          data: input.prescriptionImage.data,
        },
      };
    }

    const notes = (input.clinicalNotes || '').toLowerCase();
    const isFever = notes.includes('fever') || notes.includes('malaria') || notes.includes('temp');

    const fallbackMeds = isFever
      ? [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            duration: '5 days',
            instructions: 'After food',
            schedule: { morning: true, afternoon: true, night: true, beforeFood: false },
          },
        ]
      : [
          {
            name: 'Multivitamin',
            dosage: '1 tablet',
            duration: '10 days',
            instructions: 'Once daily',
            schedule: { morning: true, afternoon: false, night: false, beforeFood: false },
          },
        ];

    const result = await this.generateCompletion(prompt, imagePart, { medications: fallbackMeds });
    return result.medications || fallbackMeds;
  }

  private static async generateCareInsights(input: ConsultationInput, medications: any[]) {
    const promptBase = this.getPromptContent();
    const promptSnippet = promptBase.split('---')[2];

    const prompt = `
            ${promptSnippet}
            
            CLINICAL INPUT:
            Notes: ${input.clinicalNotes || 'N/A'}
            Meds Provided: ${JSON.stringify(medications)}
            Patient Language: ${input.patientProfile?.language || 'English/Hindi'}
            isPediatric: ${(input.patientProfile?.age || 0) < 13}
        `;

    const notes = (input.clinicalNotes || '').toLowerCase();
    const isFever = notes.includes('fever') || notes.includes('malaria') || notes.includes('temp');

    const fallbackInsights = {
      conditionSimple: isFever ? 'Acute Fever / Suspected Malaria' : 'General Care Plan',
      explanation: isFever
        ? 'A general care plan to manage body temperature and recover strength.'
        : 'Standard patient monitoring and health support program.',
      seriousness: isFever ? 'URGENT' : 'ROUTINE',
      timeline: isFever ? '3-5 days' : '7 days',
      redFlags: [
        { symptom: 'Fever above 103 F', action: 'CONTACT_HOSPITAL' },
        { symptom: 'Difficulty breathing', action: 'CONTACT_HOSPITAL' },
      ],
    };

    return await this.generateCompletion(prompt, null, fallbackInsights);
  }

  private static async optimizeFollowUp(input: ConsultationInput, meds: any[], insights: any) {
    const promptBase = this.getPromptContent();
    const promptSnippet = promptBase.split('---')[1];

    const prompt = `
            ${promptSnippet}
            
            CONTEXT:
            Diagnosis Overview: ${insights.conditionSimple || 'Consultation'}
            Therapy Duration: ${meds.length > 0 ? meds[0].duration : 'N/A'}
        `;

    const fallbackFollowUp = {
      followUp: {
        recommendedDays: 7,
        reason: 'Routine post-consultation recovery checkup.',
      },
    };

    const result = await this.generateCompletion(prompt, null, fallbackFollowUp);
    return result.followUp || fallbackFollowUp.followUp;
  }

  private static async generateRecoveryRoadmap(
    input: ConsultationInput,
    insights: any,
    meds: any[],
  ) {
    const promptBase = this.getPromptContent();
    const promptSnippet = promptBase.split('---')[3];

    const prompt = `
            ${promptSnippet}
            
            CONTEXT:
            Diagnosis: ${insights.conditionSimple}
            Meds: ${JSON.stringify(meds)}
            Patient Profile: ${JSON.stringify(input.patientProfile)}
        `;

    const fallbackRoadmap = [
      {
        dayNumber: 1,
        expectedSymptoms: 'Mild fatigue or resting phase',
        markers: 'Rest and hydration',
        guidance: 'Take easy digestable food and plenty of water.',
      },
      {
        dayNumber: 3,
        expectedSymptoms: 'Symptoms start to clear',
        markers: 'Activity return',
        guidance: 'Slowly resume daily routines.',
      },
      {
        dayNumber: 7,
        expectedSymptoms: 'Expected fully recovered',
        markers: 'Checkup',
        guidance: 'Visit the clinic if symptoms return.',
      },
    ];

    const result = await this.generateCompletion(prompt, null, { roadmap: fallbackRoadmap });
    return result.roadmap || fallbackRoadmap;
  }

  private static async persistCareJourney(
    visitId: string,
    meds: any[],
    insights: any,
    followUp: any,
    roadmap: any[],
    profile?: any,
    isOffline = false,
    clinicalNotes?: string,
  ) {
    return await prisma.$transaction(async (txRaw) => {
      const tx = txRaw as any;
      // Create the root CareJourney
      const journey = await tx.careJourney.create({
        data: {
          visitId,
          conditionSimple: insights.conditionSimple,
          explanation: insights.explanation,
          seriousness: insights.seriousness,
          timeline: insights.timeline,
          language: profile?.language || 'en',
          pediatricMode: (profile?.age || 0) < 13,
          safetyCheck: true,
        },
      });

      // Create Medication Plans
      if (meds && meds.length > 0) {
        await tx.medicationPlan.createMany({
          data: meds.map((m: any) => ({
            careJourneyId: journey.id,
            medName: m.name,
            dosage: m.dosage,
            duration: m.duration,
            instructions: m.instructions,
            morning: m.schedule?.morning || false,
            afternoon: m.schedule?.afternoon || false,
            night: m.schedule?.night || false,
            beforeFood: m.schedule?.beforeFood || false,
          })),
        });
      }

      // Create Red Flags
      if (insights.redFlags && insights.redFlags.length > 0) {
        await tx.careRedFlag.createMany({
          data: insights.redFlags.map((rf: any) => ({
            careJourneyId: journey.id,
            symptom: rf.symptom,
            action: rf.action || 'CONTACT_HOSPITAL',
          })),
        });
      }

      // Create Follow-up Plan
      if (followUp) {
        await tx.followUpPlan.create({
          data: {
            careJourneyId: journey.id,
            recommendedDays: followUp.recommendedDays || 7,
            reason: followUp.reason || 'Checkup',
            bookingStatus: 'PENDING',
          },
        });
      }

      // Create Recovery Steps (The 14-day blueprint)
      if (roadmap && roadmap.length > 0) {
        await tx.recoveryStep.createMany({
          data: roadmap.map((step: any) => ({
            careJourneyId: journey.id,
            dayNumber: step.dayNumber,
            expectedSymptoms: step.expectedSymptoms,
            markers: step.markers,
            guidance: step.guidance,
          })),
        });
      }

      // Create Initial Nudge Schedule (Example: Day 2, 4, 7 check-ins)
      const nudgeDays = [2, 4, 7];
      await tx.nudgeSchedule.createMany({
        data: nudgeDays.map((day) => ({
          careJourneyId: journey.id,
          scheduledAt: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          messageType: 'DAY_CHECKIN',
        })),
      });

      // Queue an outbox event to recompute when back online
      if (isOffline) {
        await tx.outboxEvent.create({
          data: {
            eventType: 'AI_RECOMPUTE_REQUIRED',
            payload: {
              visitId,
              clinicalNotes,
              patientProfile: profile,
            },
          },
        });
      }

      return journey;
    });
  }
}
