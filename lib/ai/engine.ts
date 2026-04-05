import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import prisma from "../prisma";
import logger from "../logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
        const filePath = path.join(process.cwd(), "lib", "ai", "prompts", "engine-prompts.md");
        return fs.readFileSync(filePath, "utf-8");
    }

    /**
     * Main orchestration pipeline for the Post Consultation AI
     */
    static async process(input: ConsultationInput) {
        logger.info({ action: 'process_consultation_ai', visitId: input.visitId }, 'Starting Advanced Post-Consultation AI Pipeline');

        try {
            // STEP 1: Medication Ingestion & Structuring (OCR + NLP)
            const medIntelligence = await this.ingestMedications(input);

            // STEP 2: Care Journey Generation (Simple Explanations + Red Flags)
            const careInsights = await this.generateCareInsights(input, medIntelligence);

            // STEP 3: Follow-Up Optimization (Conversion Driver)
            const followUpPlan = await this.optimizeFollowUp(input, medIntelligence, careInsights);

            // STEP 4: Recovery Roadmap Generation (Day 1-14 expectations)
            const recoveryRoadmap = await this.generateRecoveryRoadmap(input, careInsights, medIntelligence);

            // STEP 5: Persistent Transaction to DB
            return await this.persistCareJourney(input.visitId, medIntelligence, careInsights, followUpPlan, recoveryRoadmap, input.patientProfile);

        } catch (error: any) {
            logger.error({ action: 'consultation_ai_failed', visitId: input.visitId, error: error.message }, 'Failed to orchestrate Consultation AI Engine');
            throw error;
        }
    }

    private static async ingestMedications(input: ConsultationInput) {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const promptBase = this.getPromptContent();
        let promptSnippet = promptBase.split('---')[0]; // Medication Structurer section
        
        const prompt = `
            ${promptSnippet}
            
            CLINICAL CONTEXT:
            ${input.clinicalNotes || "No clinical notes provided."}
            
            ${input.prescriptionImage ? "An image of the prescription is attached." : ""}
        `;

        const contentParts: any[] = [{ text: prompt }];
        if (input.prescriptionImage) {
            contentParts.push({
                inlineData: {
                    mimeType: input.prescriptionImage.mimeType,
                    data: input.prescriptionImage.data
                }
            });
        }

        const result = await model.generateContent(contentParts);
        const response = result.response.text();
        return JSON.parse(response).medications || [];
    }

    private static async generateCareInsights(input: ConsultationInput, medications: any[]) {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const promptBase = this.getPromptContent();
        let promptSnippet = promptBase.split('---')[2]; // Patient Localization section
        
        const prompt = `
            ${promptSnippet}
            
            CLINICAL INPUT:
            Notes: ${input.clinicalNotes || "N/A"}
            Meds Provided: ${JSON.stringify(medications)}
            Patient Language: ${input.patientProfile?.language || "English/Hindi"}
            isPediatric: ${(input.patientProfile?.age || 0) < 13}
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    }

    private static async optimizeFollowUp(input: ConsultationInput, meds: any[], insights: any) {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const promptBase = this.getPromptContent();
        let promptSnippet = promptBase.split('---')[1]; // Conversion Optimizer section

        const prompt = `
            ${promptSnippet}
            
            CONTEXT:
            Diagnosis Overview: ${insights.conditionSimple || "Consultation"}
            Therapy Duration: ${meds.length > 0 ? meds[0].duration : "N/A"}
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()).followUp;
    }

    private static async generateRecoveryRoadmap(input: ConsultationInput, insights: any, meds: any[]) {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const promptBase = this.getPromptContent();
        let promptSnippet = promptBase.split('---')[3]; // Recovery Roadmap section

        const prompt = `
            ${promptSnippet}
            
            CONTEXT:
            Diagnosis: ${insights.conditionSimple}
            Meds: ${JSON.stringify(meds)}
            Patient Profile: ${JSON.stringify(input.patientProfile)}
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()).roadmap || [];
    }

    private static async persistCareJourney(visitId: string, meds: any[], insights: any, followUp: any, roadmap: any[], profile?: any) {
        return await prisma.$transaction(async (tx) => {
            // Create the root CareJourney
            const journey = await tx.careJourney.create({
                data: {
                    visitId,
                    conditionSimple: insights.conditionSimple,
                    explanation: insights.explanation,
                    seriousness: insights.seriousness,
                    timeline: insights.timeline,
                    language: profile?.language || "en",
                    pediatricMode: (profile?.age || 0) < 13,
                    safetyCheck: true
                }
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
                        beforeFood: m.schedule?.beforeFood || false
                    }))
                });
            }

            // Create Red Flags
            if (insights.redFlags && insights.redFlags.length > 0) {
                await tx.careRedFlag.createMany({
                    data: insights.redFlags.map((rf: any) => ({
                        careJourneyId: journey.id,
                        symptom: rf.symptom,
                        action: rf.action || "CONTACT_HOSPITAL"
                    }))
                });
            }

            // Create Follow-up Plan
            if (followUp) {
                await tx.followUpPlan.create({
                    data: {
                        careJourneyId: journey.id,
                        recommendedDays: followUp.recommendedDays || 7,
                        reason: followUp.reason || "Checkup",
                        bookingStatus: "PENDING"
                    }
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
                        guidance: step.guidance
                    }))
                });
            }

            // Create Initial Nudge Schedule (Example: Day 2, 4, 7 check-ins)
            const nudgeDays = [2, 4, 7];
            await tx.nudgeSchedule.createMany({
                data: nudgeDays.map(day => ({
                    careJourneyId: journey.id,
                    scheduledAt: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
                    messageType: 'DAY_CHECKIN'
                }))
            });

            return journey;
        });
    }
}
