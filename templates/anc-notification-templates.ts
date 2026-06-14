export const ANC_TEMPLATES: Record<string, string> = {
  anc_visit_reminder:
    'Namaste {patient_name}, aapki agli ANC chek-up {visit_date} ({week} hafte) ko hai. {hospital_name} mein time par aayen.',
  ifa_reminder:
    'Namaste {patient_name}, aaj ka IFA tablet lein. {doses_taken}/{target_dose} complete. ASHA didi aapke ghar aayengi.',
  tt_reminder:
    'Namaste {patient_name}, aapke liye TT {dose_number} due hai. {hospital_name} mein aayen.',
  high_risk_alert:
    'Namaste {patient_name}, aapke baare mein important baat. Dr. {doctor_name} se jaldi milen. {hospital_name} — {phone}',
  missed_visit_alert:
    'Namaste {patient_name}, aapki ANC visit miss ho gayi. ASHA didi aapke ghar aayengi. Kripya hospital aayen.',
  mcp_ready:
    'Namaste {patient_name}, aapka MCP Card taiyaar hai. {hospital_name} se lein.',
};

export function buildAncMessage(templateKey: string, variables: Record<string, string>): string {
  const template = ANC_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`ANC template not found: ${templateKey}`);
  }
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
