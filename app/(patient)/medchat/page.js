"use client";

import { useActionState, useState, startTransition, useEffect, useMemo } from "react";
import { medchatTriageAction, getTopDoctorsBySpeciality } from "@/app/actions";
import NextLink from "next/link";
import styles from "./medchat.module.css";
import { detectSpecialities } from "@/lib/medchat/triage-engine";
import { TRANSLATIONS } from "@/lib/medchat/translations";

const STEPS = (t) => [
    { label: t.step1Title, icon: "👤" },
    { label: t.step2Title, icon: "🩺" },
    { label: t.step3Title, icon: "⚠️" },
];

const DURATIONS = [
    "less than 1 day",
    "1-3 days",
    "3-7 days",
    "1-2 weeks",
    "2-4 weeks",
    "more than 1 month",
];

const GENDERS = ["Male", "Female", "Other"];

export default function MedChatPage() {
    const [lang, setLang] = useState("en"); // 'en' or 'hi'
    const t = TRANSLATIONS[lang];

    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [realtimeSpecs, setRealtimeSpecs] = useState([]);
    const [topDoctors, setTopDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [formData, setFormData] = useState({
        age: "",
        gender: "Male",
        city: "",
        duration: "1-3 days",
        symptoms: "",
        fever: "no",
        breathingDifficulty: "no",
        seizure: "no",
        consciousnessNormal: "yes",
    });

    const [state, formAction, isPending] = useActionState(async (prev, fd) => {
        const result = await medchatTriageAction(prev, fd);
        if (result?.success) {
            setShowResult(true);
            // Fetch top doctors for the recommended speciality
            loadDoctors(result.result.recommended_speciality, formData.city);
        }
        return result;
    }, null);

    const loadDoctors = async (spec, city) => {
        setLoadingDoctors(true);
        try {
            const docs = await getTopDoctorsBySpeciality(spec, city);
            setTopDoctors(docs);
        } catch (e) {
            console.error("Failed to load doctors", e);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));

        // Real-time detection for symptoms
        if (key === "symptoms") {
            const specs = detectSpecialities(value);
            setRealtimeSpecs(specs);
        }
    };

    const toggleFlag = (key) => {
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key] === "yes" ? "no" : "yes",
        }));
    };

    const canAdvance = () => {
        if (step === 0) return formData.age && formData.city;
        if (step === 1) return formData.symptoms.length >= 3;
        return true;
    };

    const handleSubmit = () => {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        startTransition(() => {
            formAction(fd);
        });
    };

    const resetForm = () => {
        setShowResult(false);
        setStep(0);
        setFormData({
            age: "", gender: "Male", city: "", duration: "1-3 days", symptoms: "",
            fever: "no", breathingDifficulty: "no", seizure: "no", consciousnessNormal: "yes",
        });
        setRealtimeSpecs([]);
        setTopDoctors([]);
    };

    // ── RESULT VIEW ───────────────────────────────────────
    if (showResult && state?.success && state.result) {
        const r = state.result;
        const isEmergency = r.urgency_level === "EMERGENCY";
        const isUrgent = r.urgency_level === "URGENT";

        return (
            <div className={styles.pageWrapper}>
                <div className={styles.resultWrapper}>
                    {/* Emergency Banner */}
                    {isEmergency && (
                        <div className={styles.emergencyBanner}>
                            <span className={styles.emergencyIcon}>🚨</span>
                            <div className={styles.emergencyText}>
                                <h3>{t.emergencyTitle}</h3>
                                <p>{t.emergencyDesc}</p>
                            </div>
                        </div>
                    )}

                    {/* Result Header */}
                    <div className={styles.resultHeader}>
                        <span
                            className={`${styles.urgencyBadge} ${isEmergency ? styles.badgeEmergency : isUrgent ? styles.badgeUrgent : styles.badgeRoutine
                                }`}
                        >
                            {isEmergency ? "🔴" : isUrgent ? "🟡" : "🟢"} {r.urgency_level}
                        </span>
                        <span className={styles.specialityTag}>
                            🏥 {r.recommended_speciality}
                        </span>
                        {r.is_ai_powered && (
                            <span className={styles.aiBadge}>
                                ✨ {t.aiPowered}
                            </span>
                        )}
                    </div>

                    {/* Red Flag Alert */}
                    {r.red_flag_detected && (
                        <div className={styles.resultCard} style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
                            <div className={styles.resultCardTitle}>
                                <span>⚠️</span> Red Flag Alert
                            </div>
                            <div className={styles.resultCardBody} style={{ color: "#B91C1C" }}>
                                One or more clinical red flags have been identified. This requires immediate professional medical evaluation.
                            </div>
                        </div>
                    )}

                    {/* Integrated Doctor Recommendations */}
                    {!isEmergency && (
                        <div className={styles.doctorsSection}>
                            <div className={styles.doctorsTitle}>📅 Top Refuted {r.recommended_speciality} Specialists in {formData.city}</div>
                            {loadingDoctors ? (
                                <div className={styles.doctorGrid}>
                                    <div className={styles.skeleton} />
                                    <div className={styles.skeleton} />
                                </div>
                            ) : topDoctors.length > 0 ? (
                                <div className={styles.doctorGrid}>
                                    {topDoctors.map((doc) => (
                                        <NextLink key={doc.id} href={`/doctor/${doc.id}`} className={styles.miniDocCard}>
                                            <div className={styles.docInfo}>
                                                <h4>{doc.name || doc.fullName}</h4>
                                                <p>{doc.speciality} • {doc.hospital}</p>
                                            </div>
                                            <div className={styles.docMeta}>
                                                <div className={styles.docRating}>⭐ {doc.stars || 4.5}</div>
                                                <div className={styles.docDist}>{doc.distance || "Near you"}</div>
                                            </div>
                                        </NextLink>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.resultCardBody}>Finding best matches for you...</div>
                            )}
                        </div>
                    )}

                    {/* Clinical Summary */}
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTitle}>
                            <span>📝</span> {t.summaryTitle}
                        </div>
                        <div className={styles.resultCardBody}>{r.clinical_summary_for_doctor}</div>
                    </div>

                    {/* AI Reasoning */}
                    {r.is_ai_powered && r.ai_reasoning && (
                        <div className={styles.aiReasoningCard}>
                            <div className={styles.aiReasoningTitle}>
                                <span>✨</span> {t.aiReasoning}
                            </div>
                            <div className={styles.aiReasoningBody}>{r.ai_reasoning}</div>
                        </div>
                    )}

                    {/* Patient Advice */}
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTitle}>
                            <span>💡</span> {t.adviceTitle}
                        </div>
                        <div className={styles.resultCardBody}>{r.patient_advice}</div>
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.resultActions}>
                        {isEmergency ? (
                            <NextLink href="/emergency" className={`${styles.ctaBook} ${styles.ctaEmergency}`}>
                                🚑 Find Emergency Care
                            </NextLink>
                        ) : (
                            <NextLink
                                href={`/search?speciality=${encodeURIComponent(r.recommended_speciality)}&city=${encodeURIComponent(formData.city)}`}
                                className={`${styles.ctaBook} ${styles.ctaBookPrimary}`}
                            >
                                📅 {t.bookBtn}
                            </NextLink>
                        )}
                        <button
                            type="button"
                            onClick={resetForm}
                            className={`${styles.ctaBook} ${styles.ctaOutline}`}
                        >
                            🔄 {t.startOverBtn}
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div className={styles.disclaimer}>
                        <div className={styles.disclaimerTitle}>
                            <span>ℹ️</span> {t.disclaimerTitle}
                        </div>
                        <p className={styles.disclaimerText}>{r.disclaimer}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            {/* Language Switcher */}
            <div className={styles.langSwitchWrapper}>
                <button
                    className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
                    onClick={() => setLang('en')}
                    suppressHydrationWarning
                >
                    EN
                </button>
                <button
                    className={`${styles.langBtn} ${lang === 'hi' ? styles.langBtnActive : ''} ml-2`}
                    onClick={() => setLang('hi')}
                    suppressHydrationWarning
                >
                    हिन्दी
                </button>
            </div>

            {/* Hero Header */}
            <div className={styles.heroHeader}>
                <div className={styles.heroContent}>
                    <div className={styles.heroIcon}>🤖</div>
                    <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
                    <p className={styles.heroSubtitle}>
                        {t.heroSubtitle}
                    </p>
                    <div className={styles.trustBar}>
                        <span className={styles.trustTag}>🔒 {t.trustNoData}</span>
                        <span className={styles.trustTag}>🩺 {t.trustClinically}</span>
                        <span className={styles.trustTag}>⚡ {t.trustInstant}</span>
                    </div>
                </div>
            </div>

            {/* Step Progress */}
            <div className={styles.progressBar}>
                {STEPS(t).map((s, i) => (
                    <div key={i} className={styles.progressStep}>
                        <div
                            className={`${styles.stepCircle} ${i === step ? styles.stepCircleActive : i < step ? styles.stepCircleDone : ""
                                }`}
                        >
                            {i < step ? "✓" : i + 1}
                        </div>
                        {i < STEPS(t).length - 1 && (
                            <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ""}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Patient Info */}
            {step === 0 && (
                <div className={styles.formCard} key="step0">
                    <div className={styles.stepTitle}>👤 {t.step1Title}</div>
                    <div className={styles.stepDesc}>
                        {t.step1Desc}
                    </div>

                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label htmlFor="medchat-age" className={styles.label}>{t.ageLabel}</label>
                            <input
                                id="medchat-age"
                                type="number"
                                className={`${styles.input}`}
                                placeholder="e.g. 28"
                                min="0"
                                max="150"
                                value={formData.age}
                                onChange={(e) => updateField("age", e.target.value)}
                                suppressHydrationWarning
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="medchat-gender" className={styles.label}>{t.genderLabel}</label>
                            <select
                                id="medchat-gender"
                                className={`${styles.input} ${styles.select}`}
                                value={formData.gender}
                                onChange={(e) => updateField("gender", e.target.value)}
                                suppressHydrationWarning
                            >
                                {GENDERS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-city" className={styles.label}>{t.cityLabel}</label>
                        <input
                            id="medchat-city"
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Hyderabad"
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                            suppressHydrationWarning
                        />
                    </div>

                    <div className={styles.buttonRow}>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={!canAdvance()}
                            onClick={() => setStep(1)}
                        >
                            {t.continueBtn}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Symptoms */}
            {step === 1 && (
                <div className={styles.formCard} key="step1">
                    <div className={styles.stepTitle}>🩺 {t.step2Title}</div>
                    <div className={styles.stepDesc}>
                        {t.step2Desc}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-symptoms" className={styles.label}>{t.symptomsLabel}</label>
                        <textarea
                            id="medchat-symptoms"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="e.g. I have a severe headache on the right side with nausea for the last 2 days..."
                            value={formData.symptoms}
                            onChange={(e) => updateField("symptoms", e.target.value)}
                            maxLength={2000}
                            suppressHydrationWarning
                        />
                        {/* Real-time feedback pills */}
                        <div className={styles.realtimePills}>
                            {realtimeSpecs.map((spec) => (
                                <span key={spec} className={styles.realtimePill}>
                                    ✨ Matching {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-duration" className={styles.label}>{t.durationLabel}</label>
                        <select
                            id="medchat-duration"
                            className={`${styles.input} ${styles.select}`}
                            value={formData.duration}
                            onChange={(e) => updateField("duration", e.target.value)}
                            suppressHydrationWarning
                        >
                            {DURATIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.btnSecondary} onClick={() => setStep(0)}>
                            {t.backBtn}
                        </button>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={!canAdvance()}
                            onClick={() => setStep(2)}
                        >
                            {t.continueBtn}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Safety Check */}
            {step === 2 && (
                <div className={styles.formCard} key="step2">
                    <div className={styles.stepTitle}>⚠️ {t.step3Title}</div>
                    <div className={styles.stepDesc}>
                        {t.step3Desc}
                    </div>

                    <div className={styles.toggleGroup}>
                        {/* Fever */}
                        <div className={styles.toggleCard} onClick={() => toggleFlag("fever")}>
                            <span className={styles.toggleLabel}>
                                <span className={styles.toggleLabelIcon}>🌡️</span> {t.feverLabel}
                            </span>
                            <div className={`${styles.toggleSwitch} ${formData.fever === "yes" ? styles.toggleSwitchActive : ""}`}>
                                <div className={`${styles.toggleDot} ${formData.fever === "yes" ? styles.toggleDotActive : ""}`} />
                            </div>
                        </div>

                        {/* Breathing Difficulty */}
                        <div
                            className={`${styles.toggleCard} ${styles.toggleCardDanger}`}
                            onClick={() => toggleFlag("breathingDifficulty")}
                        >
                            <span className={styles.toggleLabel}>
                                <span className={styles.toggleLabelIcon}>😮‍💨</span> {t.breathingLabel}
                            </span>
                            <div
                                className={`${styles.toggleSwitch} ${formData.breathingDifficulty === "yes" ? styles.toggleSwitchDanger : ""
                                    }`}
                            >
                                <div
                                    className={`${styles.toggleDot} ${formData.breathingDifficulty === "yes" ? styles.toggleDotActive : ""
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Seizure */}
                        <div
                            className={`${styles.toggleCard} ${styles.toggleCardDanger}`}
                            onClick={() => toggleFlag("seizure")}
                        >
                            <span className={styles.toggleLabel}>
                                <span className={styles.toggleLabelIcon}>⚡</span> {t.seizureLabel}
                            </span>
                            <div
                                className={`${styles.toggleSwitch} ${formData.seizure === "yes" ? styles.toggleSwitchDanger : ""
                                    }`}
                            >
                                <div className={`${styles.toggleDot} ${formData.seizure === "yes" ? styles.toggleDotActive : ""}`} />
                            </div>
                        </div>

                        {/* Consciousness */}
                        <div
                            className={`${styles.toggleCard} ${styles.toggleCardDanger}`}
                            onClick={() => toggleFlag("consciousnessNormal")}
                        >
                            <span className={styles.toggleLabel}>
                                <span className={styles.toggleLabelIcon}>🧠</span>{" "}
                                {formData.consciousnessNormal === "yes" ? t.consciousnessLabel : `${t.consciousnessLabel} Altered ⚠️`}
                            </span>
                            <div
                                className={`${styles.toggleSwitch} ${formData.consciousnessNormal === "yes" ? styles.toggleSwitchActive : styles.toggleSwitchDanger
                                    }`}
                            >
                                <div
                                    className={`${styles.toggleDot} ${formData.consciousnessNormal === "yes" ? styles.toggleDotActive : ""
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {state && !state.success && state.message && (
                        <div className={styles.errorMsg}>⚠️ {state.message}</div>
                    )}

                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)} suppressHydrationWarning>
                            {t.backBtn}
                        </button>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={isPending}
                            onClick={handleSubmit}
                            suppressHydrationWarning
                        >
                            {isPending ? (
                                <>
                                    <span className={styles.spinner} /> {t.analyzing}
                                </>
                            ) : (
                                <>🩺 {t.analyzeBtn}</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

