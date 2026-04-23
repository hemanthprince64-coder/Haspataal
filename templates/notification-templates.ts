export const TEMPLATES: Record<string, string> = {
  followup_reminder_7d: "Namaste {patient_name}! {hospital_name} yaad dila raha hai — aapka follow-up 7 din mein hai. {doctor_name} se milne ka waqt book karein.",
  followup_reminder_30d: "Namaste {patient_name}! Aapke discharge ke 30 din ho gaye. {hospital_name} mein check-in book karein.",
  vaccination_reminder: "Dear {parent_name}, {child_name} ki next vaccination {vaccine_name} — {due_date} tak karwani hai. {hospital_name}.",
  bill_receipt: "{patient_name}, aapka bill Rs. {amount} receive ho gaya. Receipt: {receipt_url}",
  opd_token: "Aapka OPD token #{token_number} hai. Estimated wait: {wait_time} min. - {hospital_name}",
  lab_result_ready: "Namaste {patient_name}, aapke lab results ({test_name}) ready hain. View here: {result_url}"
};

/**
 * Replaces {variable} in templates with actual values
 */
export function buildMessage(templateKey: string, variables: Record<string, string>): string {
  let template = TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Template not found: ${templateKey}`);
  }

  for (const [key, value] of Object.entries(variables)) {
    template = template.replace(new RegExp(`{${key}}`, 'g'), value);
  }

  return template;
}
