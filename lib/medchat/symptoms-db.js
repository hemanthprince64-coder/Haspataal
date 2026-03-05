/**
 * MedChat AI — Curated Medical Symptom Database
 * ============================================
 * Rule-based symptom → speciality mapping, red-flag detection,
 * pediatric escalation rules, and risk scoring weights.
 *
 * SAFETY: This is NOT a diagnostic tool.
 * It provides TRIAGE GUIDANCE only.
 */

// ── RED FLAG PATTERNS ──────────────────────────────────────
// Any match → EMERGENCY classification, risk_score ≥ 80

export const RED_FLAGS = [
    { pattern: /seizure|convulsion|fits/i, label: 'Seizure / Convulsion' },
    { pattern: /unconscious|unresponsive|not responding/i, label: 'Unconsciousness' },
    { pattern: /not breathing|can'?t breathe|severe breathing|respiratory arrest/i, label: 'Severe breathing difficulty' },
    { pattern: /blue\s?lips|cyanosis|bluish/i, label: 'Cyanosis (bluish lips)' },
    { pattern: /persistent vomiting.{0,20}lethargy|lethargy.{0,20}persistent vomiting/i, label: 'Persistent vomiting with lethargy' },
    { pattern: /altered sensorium|confused.{0,15}disoriented|delirium/i, label: 'Altered sensorium' },
    { pattern: /severe dehydration|sunken eyes.{0,20}dry mouth|no tears.{0,15}dry/i, label: 'Severe dehydration' },
    { pattern: /chest pain.{0,20}sweat|sweat.{0,20}chest pain/i, label: 'Chest pain with sweating' },
    { pattern: /not passing urine|no urine|anuria/i, label: 'Not passing urine' },
    { pattern: /continuous crying.{0,20}(poor|not) respon/i, label: 'Continuous crying with poor responsiveness (pediatric)' },
    { pattern: /stroke|paralysis.{0,15}sudden|sudden.{0,15}paralysis|face drooping/i, label: 'Possible stroke' },
    { pattern: /severe bleed|heavy bleed|hemorrhag/i, label: 'Severe bleeding / hemorrhage' },
    { pattern: /snake\s?bite|poisoning|overdose/i, label: 'Poisoning / envenomation' },
    { pattern: /head injury|skull fracture|severe trauma/i, label: 'Head injury / severe trauma' },
    { pattern: /burns?.{0,10}(severe|major|large)/i, label: 'Severe burns' },
];

// ── PEDIATRIC ESCALATION RULES ─────────────────────────────
// Applied when age < 18; infant rules when age < 1

export const PEDIATRIC_RULES = {
    infantAgeThreshold: 1,    // years
    childAgeThreshold: 18,    // years
    infantEscalationTriggers: [
        { pattern: /fever|temperature|hot/i, label: 'Fever in infant', riskBoost: 35 },
        { pattern: /poor feeding|not feeding|refusing feed/i, label: 'Poor feeding in infant', riskBoost: 30 },
        { pattern: /excessive sleep|letharg|drowsy|sleepy/i, label: 'Excessive sleepiness in infant', riskBoost: 30 },
        { pattern: /bulging fontanelle/i, label: 'Bulging fontanelle', riskBoost: 40 },
    ],
    childEscalationTriggers: [
        { pattern: /dehydrat/i, label: 'Dehydration in child', riskBoost: 20 },
        { pattern: /poor feeding|not eating/i, label: 'Poor feeding in child', riskBoost: 15 },
        { pattern: /letharg|excessive sleep/i, label: 'Lethargy in child', riskBoost: 20 },
        { pattern: /persistent.{0,10}(high )?fever/i, label: 'Persistent high fever in child', riskBoost: 20 },
        { pattern: /fast breath|rapid breath|chest (indraw|retract)/i, label: 'Respiratory distress in child', riskBoost: 25 },
    ],
};

// ── SYMPTOM → SPECIALITY MAPPING ───────────────────────────
// Each entry: keyword patterns, associated speciality, risk weight, broad category

export const SYMPTOM_MAP = [
    // Cardiology
    {
        patterns: [/chest pain/i, /palpitat/i, /heart\s?beat/i, /blood pressure|hypertension/i],
        speciality: 'Cardiology', category: 'Cardiovascular symptoms', riskWeight: 25
    },

    // Pulmonology
    {
        patterns: [/cough/i, /breath/i, /wheez/i, /asthma/i, /pneumonia/i, /chest tight/i],
        speciality: 'Pulmonology', category: 'Respiratory symptoms', riskWeight: 20
    },

    // Neurology
    {
        patterns: [/headache|migraine/i, /dizz|vertigo/i, /numb/i, /tingling/i, /memory loss/i, /tremor/i],
        speciality: 'Neurology', category: 'Neurological symptoms', riskWeight: 18
    },

    // Gastroenterology
    {
        patterns: [/stomach|abdom/i, /nausea|vomit/i, /diarr/i, /constipat/i, /acid.?reflux|heartburn/i, /bloat/i],
        speciality: 'Gastroenterology', category: 'Gastrointestinal symptoms', riskWeight: 12
    },

    // Orthopedics
    {
        patterns: [/bone|fracture/i, /joint pain/i, /back pain|spine/i, /knee/i, /shoulder/i, /sprain|strain/i],
        speciality: 'Orthopedics', category: 'Musculoskeletal symptoms', riskWeight: 10
    },

    // Dermatology
    {
        patterns: [/rash/i, /itch/i, /skin/i, /acne/i, /eczema|psoriasis/i, /fungal/i, /boil|abscess/i],
        speciality: 'Dermatology', category: 'Dermatological symptoms', riskWeight: 6
    },

    // ENT
    {
        patterns: [/ear\s?(pain|ache|infection)/i, /sore throat|throat pain/i, /running nose|nasal/i, /sinus/i, /hearing/i, /tonsil/i],
        speciality: 'ENT (Otolaryngology)', category: 'Ear, Nose & Throat symptoms', riskWeight: 8
    },

    // Ophthalmology
    {
        patterns: [/eye\s?(pain|red|infection|itch)/i, /vision|blurr/i, /watery eyes/i],
        speciality: 'Ophthalmology', category: 'Ophthalmic symptoms', riskWeight: 10
    },

    // Urology
    {
        patterns: [/urin/i, /kidney|renal/i, /bladder/i, /burning\s?urin/i],
        speciality: 'Urology', category: 'Urinary symptoms', riskWeight: 14
    },

    // Gynecology
    {
        patterns: [/menstrual|period/i, /vaginal/i, /pregnan/i, /pelvic pain/i, /breast\s?(pain|lump)/i],
        speciality: 'Gynecology', category: 'Gynecological symptoms', riskWeight: 14
    },

    // Pediatrics
    {
        patterns: [/child|infant|baby|toddler|newborn/i],
        speciality: 'Pediatrics', category: 'Pediatric symptoms', riskWeight: 15
    },

    // Psychiatry
    {
        patterns: [/anxiety|panic/i, /depress/i, /insomnia|sleep\s?problem/i, /suicid/i, /stress|mental/i],
        speciality: 'Psychiatry', category: 'Mental health symptoms', riskWeight: 16
    },

    // Endocrinology
    {
        patterns: [/diabet|sugar/i, /thyroid/i, /weight\s?(gain|loss)/i, /hormone/i],
        speciality: 'Endocrinology', category: 'Endocrine / metabolic symptoms', riskWeight: 12
    },

    // Dentistry
    {
        patterns: [/tooth|dental|gum\s?(pain|bleed)/i, /jaw pain/i],
        speciality: 'Dentistry', category: 'Dental symptoms', riskWeight: 6
    },

    // General Medicine (fallback)
    {
        patterns: [/fever/i, /fatigue|tired/i, /weak/i, /body\s?ache|pain/i, /cold|flu/i, /swelling/i, /infection/i, /allergy/i],
        speciality: 'General Medicine', category: 'General symptoms', riskWeight: 8
    },

    // Emergency Medicine
    {
        patterns: [/accident|trauma|fall|injur/i, /burn/i, /bite/i, /bleed/i, /chok/i],
        speciality: 'Emergency Medicine', category: 'Trauma / Emergency symptoms', riskWeight: 22
    },
];

// ── SEASONAL & REGIONAL PATTERNS ──────────────────────────
// High-relevance in specific Indian contexts

export const SEASONAL_PATTERNS = [
    {
        patterns: [/dengue|platelet|breakbone/i, /severe.{0,10}body\s?ache/i],
        speciality: 'General Medicine/Internal Medicine',
        category: 'Possible Seasonal (Dengue)',
        riskWeight: 20
    },
    {
        patterns: [/malaria|chill.{0,10}shiver|shiver.{0,10}chill/i],
        speciality: 'General Medicine',
        category: 'Possible Seasonal (Malaria)',
        riskWeight: 18
    },
    {
        patterns: [/typhoid|step\s?ladder\s?fever|prolonged\s?fever/i],
        speciality: 'General Medicine',
        category: 'Possible Seasonal (Typhoid)',
        riskWeight: 15
    }
];

// ── LOCALIZED RISK FACTORS ────────────────────────────────
// City-based risk adjustments (e.g., during outbreaks)

export const LOCAL_RISKS = {
    'Hyderabad': { dengueStatus: 'HIGH', malariaStatus: 'MEDIUM', alert: 'Seasonal fever spike reported' },
    'Delhi': { pollutionStatus: 'CRITICAL', respiratoryRisk: 2.0, alert: 'High AQI - Respiratory caution' },
    'Mumbai': { monsoonRisk: 'HIGH', leptospirosisAlert: true },
    'Bangalore': { allergyStatus: 'HIGH' }
};

// ── DURATION-BASED RISK MODIFIERS ──────────────────────────

export const DURATION_MODIFIERS = {
    'less than 1 day': 0,
    '1-3 days': 0,
    '3-7 days': 5,
    '1-2 weeks': 10,
    '2-4 weeks': 15,
    'more than 1 month': 20,
};

// ── BOOLEAN FLAG RISK BOOSTS ───────────────────────────────

export const FLAG_BOOSTS = {
    fever: 10,
    breathingDifficulty: 25,
    seizure: 50,       // auto-EMERGENCY
    consciousnessNormal: -5,  // if consciousness is normal, slight risk reduction
    consciousnessAbnormal: 45, // unconscious → near-EMERGENCY
};

// ── JAILBREAK DETECTION ────────────────────────────────────

export const JAILBREAK_PATTERNS = [
    /ignore\s*(previous|all|prior)\s*(instructions|prompts|rules)/i,
    /act\s*as\s*(a\s*)?(doctor|physician|medical\s*professional)/i,
    /you\s*are\s*now\s*(a\s*)?(doctor|medical)/i,
    /prescribe\s*(me|us)?\s*(a\s*)?(medicine|medication|drug|tablet)/i,
    /confirm\s*(that|if)\s*(I|he|she|the patient)\s*ha(ve|s)/i,
    /what\s*(medicine|drug|tablet|dosage)\s*should/i,
    /override\s*(instruction|safety|protocol)/i,
    /reveal\s*(your|the)\s*(prompt|instruction|system)/i,
    /forget\s*(everything|your\s*instructions)/i,
    /disregard\s*(safety|previous|all)/i,
];

export const JAILBREAK_RESPONSE = {
    urgency_level: 'ROUTINE',
    red_flag_detected: false,
    recommended_speciality: 'General Medicine',
    possible_categories: ['General consultation requested'],
    clinical_summary_for_doctor: 'Patient input contained non-clinical content. No valid symptoms could be extracted for triage. Recommend standard consultation to assess patient needs.',
    patient_advice: 'MedChat AI is designed to help you describe your symptoms so we can guide you to the right doctor. For medical advice, diagnosis, or prescriptions, please consult a qualified healthcare professional directly. You can book an appointment through Haspataal.',
    disclaimer: 'MedChat AI provides triage guidance for informational purposes only. It does not provide medical diagnosis or treatment. Please consult a qualified doctor for proper evaluation. If symptoms worsen, seek immediate emergency care.',
    probable_differentials_hidden: ['Non-clinical input detected'],
    risk_score_internal: 0,
};
