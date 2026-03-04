"use client";

import { useActionState, useState, startTransition } from "react";
import { medchatTriageAction } from "@/app/actions";
import Link from "next/link";
import styles from "./medchat.module.css";

const STEPS = [
    { label: "Patient Info", icon: "👤" },
    { label: "Symptoms", icon: "🩺" },
    { label: "Red Flags", icon: "⚠️" },
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
    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);
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
        if (result?.success) setShowResult(true);
        return result;
    }, null);

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
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
                                <h3>Emergency — Immediate Medical Attention Required</h3>
                                <p>
                                    Red flags have been detected in the reported symptoms. Please proceed to the nearest
                                    hospital emergency department immediately or call emergency services.
                                </p>
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

                    {/* Categories */}
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTitle}>
                            <span>🏷️</span> Symptom Categories
                        </div>
                        <div className={styles.categoryChips}>
                            {r.possible_categories.map((c, i) => (
                                <span key={i} className={styles.categoryChip}>
                                    📋 {c}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Clinical Summary */}
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTitle}>
                            <span>📝</span> Clinical Summary for Doctor
                        </div>
                        <div className={styles.resultCardBody}>{r.clinical_summary_for_doctor}</div>
                    </div>

                    {/* EHR Transmission Payload (TOON Format) */}
                    {r.toon_compressed_record && (
                        <div className={styles.resultCard} style={{ background: "#F1F5F9", borderColor: "#CBD5E1" }}>
                            <div className={styles.resultCardTitle}>
                                <span>📡</span> EHR Transmission Token (TOON Format)
                            </div>
                            <div className={styles.resultCardBody}>
                                <pre className={styles.toonCodeBlock}>
                                    <code>{r.toon_compressed_record}</code>
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Patient Advice */}
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTitle}>
                            <span>💡</span> Guidance for You
                        </div>
                        <div className={styles.resultCardBody}>{r.patient_advice}</div>
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.resultActions}>
                        {isEmergency ? (
                            <Link href="/emergency" className={`${styles.ctaBook} ${styles.ctaEmergency}`}>
                                🚑 Find Emergency Care
                            </Link>
                        ) : (
                            <Link
                                href={`/search?speciality=${encodeURIComponent(r.recommended_speciality)}`}
                                className={`${styles.ctaBook} ${styles.ctaBookPrimary}`}
                            >
                                📅 Book {r.recommended_speciality} Appointment
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={resetForm}
                            className={`${styles.ctaBook} ${styles.ctaOutline}`}
                        >
                            🔄 Start Over
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div className={styles.disclaimer}>
                        <div className={styles.disclaimerTitle}>
                            <span>ℹ️</span> Medical Disclaimer
                        </div>
                        <p className={styles.disclaimerText}>{r.disclaimer}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── FORM VIEW ──────────────────────────────────────────

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Header */}
            <div className={styles.heroHeader}>
                <div className={styles.heroContent}>
                    <div className={styles.heroIcon}>🤖</div>
                    <h1 className={styles.heroTitle}>
                        Med<span>Chat</span> AI
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Tell us your symptoms — we&apos;ll guide you to the right specialist, safely and instantly.
                    </p>
                    <div className={styles.trustBar}>
                        <span className={styles.trustTag}>🔒 No data stored</span>
                        <span className={styles.trustTag}>🩺 Clinically structured</span>
                        <span className={styles.trustTag}>⚡ Instant triage</span>
                    </div>
                </div>
            </div>

            {/* Step Progress */}
            <div className={styles.progressBar}>
                {STEPS.map((s, i) => (
                    <div key={i} className={styles.progressStep}>
                        <div
                            className={`${styles.stepCircle} ${i === step ? styles.stepCircleActive : i < step ? styles.stepCircleDone : ""
                                }`}
                        >
                            {i < step ? "✓" : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ""}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Patient Info */}
            {step === 0 && (
                <div className={styles.formCard} key="step0">
                    <div className={styles.stepTitle}>👤 Patient Information</div>
                    <div className={styles.stepDesc}>
                        Basic details help us apply age-specific and gender-specific triage rules.
                    </div>

                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label htmlFor="medchat-age" className={styles.label}>Age (years)</label>
                            <input
                                id="medchat-age"
                                type="number"
                                className={`${styles.input}`}
                                placeholder="e.g. 28"
                                min="0"
                                max="150"
                                value={formData.age}
                                onChange={(e) => updateField("age", e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="medchat-gender" className={styles.label}>Gender</label>
                            <select
                                id="medchat-gender"
                                className={`${styles.input} ${styles.select}`}
                                value={formData.gender}
                                onChange={(e) => updateField("gender", e.target.value)}
                            >
                                {GENDERS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-city" className={styles.label}>City</label>
                        <input
                            id="medchat-city"
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Hyderabad"
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                        />
                    </div>

                    <div className={styles.buttonRow}>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={!canAdvance()}
                            onClick={() => setStep(1)}
                        >
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Symptoms */}
            {step === 1 && (
                <div className={styles.formCard} key="step1">
                    <div className={styles.stepTitle}>🩺 Describe Your Symptoms</div>
                    <div className={styles.stepDesc}>
                        Describe what you&apos;re experiencing in your own words. Include pain location, severity, and when it started.
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-symptoms" className={styles.label}>Symptoms</label>
                        <textarea
                            id="medchat-symptoms"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="e.g. I have a severe headache on the right side with nausea for the last 2 days..."
                            value={formData.symptoms}
                            onChange={(e) => updateField("symptoms", e.target.value)}
                            maxLength={2000}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="medchat-duration" className={styles.label}>Duration of Symptoms</label>
                        <select
                            id="medchat-duration"
                            className={`${styles.input} ${styles.select}`}
                            value={formData.duration}
                            onChange={(e) => updateField("duration", e.target.value)}
                        >
                            {DURATIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.btnSecondary} onClick={() => setStep(0)}>
                            ← Back
                        </button>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={!canAdvance()}
                            onClick={() => setStep(2)}
                        >
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Red Flags / Boolean Checks */}
            {step === 2 && (
                <div className={styles.formCard} key="step2">
                    <div className={styles.stepTitle}>⚠️ Quick Safety Check</div>
                    <div className={styles.stepDesc}>
                        These questions help us identify any immediate red flags. Answer honestly — this is critical for your safety.
                    </div>

                    <div className={styles.toggleGroup}>
                        {/* Fever */}
                        <div className={styles.toggleCard} onClick={() => toggleFlag("fever")}>
                            <span className={styles.toggleLabel}>
                                <span className={styles.toggleLabelIcon}>🌡️</span> Fever
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
                                <span className={styles.toggleLabelIcon}>😮‍💨</span> Breathing Difficulty
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
                                <span className={styles.toggleLabelIcon}>⚡</span> Seizure / Fits
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
                                {formData.consciousnessNormal === "yes" ? "Consciousness Normal" : "Consciousness Altered ⚠️"}
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
                        <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>
                            ← Back
                        </button>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={isPending}
                            onClick={handleSubmit}
                        >
                            {isPending ? (
                                <>
                                    <span className={styles.spinner} /> Analyzing...
                                </>
                            ) : (
                                "🩺 Analyze Symptoms"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
