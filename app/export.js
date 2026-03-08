/**
 * Generates a formatted text report from patient data and triggers a download.
 * @param {Object} patient - The patient data object retrieved from the database
 */
export function downloadPatientReport(patient) {
    if (!patient) return;

    let report = `=================================================\n`;
    report += `              PATIENT HEALTH REPORT              \n`;
    report += `=================================================\n\n`;

    // 1. Basic Details
    report += `--- Patient Information ---\n`;
    report += `Name: ${patient.name || 'N/A'}\n`;
    report += `Phone: ${patient.phone || 'N/A'}\n`;
    report += `DOB: ${patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}\n`;
    report += `Gender: ${patient.gender || 'N/A'}\n`;
    report += `Blood Group: ${patient.bloodGroup || 'N/A'}\n\n`;

    // 2. Vitals
    if (patient.vitals && patient.vitals.length > 0) {
        report += `--- Recent Vitals ---\n`;
        const latestVitals = patient.vitals.slice(-5).reverse(); // Last 5
        latestVitals.forEach(v => {
            report += `[${new Date(v.recordedAt).toLocaleString()}]\n`;
            if (v.bloodPressure) report += `  BP: ${v.bloodPressure}\n`;
            if (v.pulse) report += `  Pulse: ${v.pulse} bpm\n`;
            if (v.bloodSugar) report += `  Sugar: ${v.bloodSugar} mg/dL\n`;
            if (v.spo2) report += `  SpO2: ${v.spo2}%\n`;
            if (v.weight) report += `  Weight: ${v.weight} kg\n`;
            if (v.temperature) report += `  Temp: ${v.temperature} F\n`;
        });
        report += `\n`;
    }

    // 3. Medications
    if (patient.medications && patient.medications.length > 0) {
        report += `--- Current Medications ---\n`;
        patient.medications.forEach(m => {
            report += `- ${m.drugName} ` + (m.dose ? `(${m.dose}) ` : '') + `[${m.frequency}]\n`;
        });
        report += `\n`;
    }

    // 4. Medical History
    if (patient.medicalHistory) {
        report += `--- Medical History ---\n`;
        const mh = patient.medicalHistory;
        if (mh.chronicDiseases) report += `Chronic Conditions: ${mh.chronicDiseases}\n`;
        if (mh.pastIllnesses) report += `Past Illnesses: ${mh.pastIllnesses}\n`;
        if (mh.surgeries) report += `Surgeries: ${mh.surgeries}\n`;
        if (mh.allergies) report += `Allergies: ${mh.allergies}\n`;
        if (mh.drugAllergies) report += `Drug Allergies: ${mh.drugAllergies}\n`;
        report += `\n`;
    }

    // Create blobs and prepare download
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${patient.name?.replace(/\s+/g, '_') || 'patient'}_health_report.txt`);

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
