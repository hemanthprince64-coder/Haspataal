import { GoogleGenerativeAI } from '@google/generative-ai';

import { prisma } from '@/lib/util/prisma-singleton';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface RiskAnalysis {
  pretermRisk: 'low' | 'medium' | 'high';
  pihRisk: 'normal' | 'mild' | 'severe';
  gdmRisk: 'low' | 'medium' | 'high';
  iugrRisk: 'low' | 'medium' | 'high';
  narrativeSummary: string; // Hindi/Bhojpuri summary
}

export const aiRiskService = {
  /**
   * Evaluates risks based on vitals, history, and lab results,
   * then generates an AI clinical/patient summary narrative.
   */
  async evaluatePregnancyRisk(
    pregnancyId: string,
    language: 'hi' | 'bho' | 'en' = 'hi',
  ): Promise<RiskAnalysis> {
    const profile = await prisma.pregnancyProfile.findUnique({
      where: { id: pregnancyId },
      include: {
        visits: { orderBy: { visitDate: 'asc' } },
        obstetricHistory: true,
      },
    });

    if (!profile) {
      throw new Error('Pregnancy profile not found');
    }

    const visits = profile.visits || [];
    const latestVisit = visits[visits.length - 1];
    const obsHistory = profile.obstetricHistory || [];

    // 1. Rule-based assessment
    let pretermRisk: 'low' | 'medium' | 'high' = 'low';
    let pihRisk: 'normal' | 'mild' | 'severe' = 'normal';
    let gdmRisk: 'low' | 'medium' | 'high' = 'low';
    let iugrRisk: 'low' | 'medium' | 'high' = 'low';

    // Pre-term risk
    const hasPretermHistory = obsHistory.some((h) => (h.previousGestationalAge ?? 40) < 37);
    if (hasPretermHistory || profile.gravida >= 4) {
      pretermRisk = 'high';
    } else if (profile.gestationalAge && profile.gestationalAge < 37 && profile.highRisk) {
      pretermRisk = 'medium';
    }

    // PIH risk
    if (latestVisit) {
      const sys = latestVisit.bpSystolic ?? 120;
      const dia = latestVisit.bpDiastolic ?? 80;
      if (sys >= 160 || dia >= 110) {
        pihRisk = 'severe';
      } else if (sys >= 140 || dia >= 90) {
        pihRisk = 'mild';
      }
    }

    // GDM risk
    if (latestVisit && latestVisit.bloodSugar) {
      if (latestVisit.bloodSugar >= 140) {
        gdmRisk = 'high';
      } else if (latestVisit.bloodSugar >= 120) {
        gdmRisk = 'medium';
      }
    }

    // IUGR risk (SFH lagging by >3cm)
    if (profile.gestationalAge && latestVisit?.fundalHeightCm) {
      const expectedSfh = profile.gestationalAge; // rule of thumb: SFH in cm ~= GA in weeks
      const diff = expectedSfh - latestVisit.fundalHeightCm;
      if (diff >= 3) {
        iugrRisk = 'high';
      } else if (diff >= 2) {
        iugrRisk = 'medium';
      }
    }

    // 2. Narrative generation (Gemini with local fallback)
    const systemPrompt = `You are a maternal health AI assistant in Bihar, India.
Generate a supportive, patient-friendly advice summary in ${language === 'bho' ? 'Bhojpuri (using Devanagari script)' : language === 'hi' ? 'Hindi' : 'English'}.
Address the patient directly. Keep it brief (2-3 sentences), encouraging, and clear.
Risk Context:
- Gestational age: ${profile.gestationalAge || 'unknown'} weeks
- High risk status: ${profile.highRisk ? 'YES' : 'NO'} (${profile.highRiskReasons.join(', ')})
- Blood Pressure: ${latestVisit ? `${latestVisit.bpSystolic}/${latestVisit.bpDiastolic}` : 'Not measured'}
- Anemia (Hemoglobin): ${latestVisit?.hemoglobin ? `${latestVisit.hemoglobin} g/dL` : 'Not tested'}`;

    let narrativeSummary = '';
    const hasApiKey = !!process.env.GEMINI_API_KEY;

    if (hasApiKey && process.env.NETWORK_STATUS !== 'offline') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(systemPrompt);
        narrativeSummary = response.response.text().trim();
      } catch (err) {
        console.warn('Gemini API call failed for pregnancy risk narrative, using fallback');
      }
    }

    if (!narrativeSummary) {
      // Offline / Fallback templates
      if (language === 'bho') {
        narrativeSummary = profile.highRisk
          ? `प्रणाम। राउर गर्भ में कुछ जोखिम बा। नियमित जांच करवावत रहीं आउर आशा दीदी से मिलत रहीं।`
          : `प्रणाम। राउर गर्भ सामान्य बा। सुथार भोजन करीं आउर समय पर सुई लेत रहीं।`;
      } else if (language === 'hi') {
        narrativeSummary = profile.highRisk
          ? `नमस्ते। आपकी गर्भावस्था में कुछ जोखिम के संकेत हैं। कृपया नियमित रूप से डॉक्टर और आशा दीदी से संपर्क में रहें।`
          : `नमस्ते। आपकी गर्भावस्था सामान्य रूप से चल रही है। पौष्टिक आहार लें और समय पर अपनी जांच करवाएं।`;
      } else {
        narrativeSummary = profile.highRisk
          ? `Hello. There are some risk factors flagged in your pregnancy. Please stay in touch with your doctor and ASHA worker.`
          : `Hello. Your pregnancy is progressing normally. Eat healthy and ensure timely clinical visits.`;
      }
    }

    return {
      pretermRisk,
      pihRisk,
      gdmRisk,
      iugrRisk,
      narrativeSummary,
    };
  },
};
