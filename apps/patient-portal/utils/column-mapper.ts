/**
 * Column mapper utilities for Bihar NHM Patient Register CSV import
 * Defines target field schema and fuzzy header mapping logic
 */

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
  aliases: string[]; // CSV header aliases for fuzzy matching
}

export const TARGET_FIELDS: TargetField[] = [
  {
    key: 'name',
    label: 'Patient Name',
    required: true,
    aliases: ['name', 'patient name', 'full name', 'patient', 'naam', 'नाम', 'पूरा नाम'],
  },
  {
    key: 'phone',
    label: 'Mobile Number',
    required: false,
    aliases: ['phone', 'mobile', 'mobile number', 'contact', 'number', 'phone number', 'mobile no', 'mob', 'फोन', 'मोबाइल'],
  },
  {
    key: 'age',
    label: 'Age',
    required: false,
    aliases: ['age', 'patient age', 'umra', 'उम्र', 'आयु'],
  },
  {
    key: 'gender',
    label: 'Gender',
    required: false,
    aliases: ['gender', 'sex', 'ling', 'लिंग'],
  },
  {
    key: 'village',
    label: 'Village / Address',
    required: false,
    aliases: ['village', 'address', 'gaon', 'locality', 'gram', 'गाँव', 'ग्राम', 'पता'],
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    required: false,
    aliases: ['dob', 'date of birth', 'birth date', 'janm tithi', 'जन्म तिथि'],
  },
  {
    key: 'abhaId',
    label: 'ABHA ID / UHID',
    required: false,
    aliases: ['abha', 'abha id', 'health id', 'uhid', 'abha address'],
  },
  {
    key: 'district',
    label: 'District',
    required: false,
    aliases: ['district', 'jila', 'जिला'],
  },
];

/**
 * Perform fuzzy header mapping: given a list of CSV headers,
 * return a mapping of header -> target field key (or null if unmatched)
 */
export function autoMapHeaders(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    let matched: string | null = null;

    for (const field of TARGET_FIELDS) {
      const isMatch = field.aliases.some((alias) => {
        const normalizedAlias = alias.toLowerCase().trim();
        return (
          normalizedHeader === normalizedAlias ||
          normalizedHeader.includes(normalizedAlias) ||
          normalizedAlias.includes(normalizedHeader)
        );
      });

      if (isMatch) {
        matched = field.key;
        break;
      }
    }

    mapping[header] = matched;
  }

  return mapping;
}

/**
 * Validates a mapped row, returning a list of validation errors
 */
export function validateRow(
  row: Record<string, string>,
  mapping: Record<string, string | null>,
  rowIndex: number,
): string[] {
  const errors: string[] = [];
  const mapped: Record<string, string> = {};

  // Build mapped values
  for (const [csvHeader, targetKey] of Object.entries(mapping)) {
    if (targetKey && row[csvHeader]) {
      mapped[targetKey] = row[csvHeader].trim();
    }
  }

  // Validate required fields
  if (!mapped.name || mapped.name.length < 2) {
    errors.push(`Row ${rowIndex}: Patient Name is required and must be at least 2 characters`);
  }

  // Validate phone if provided
  if (mapped.phone) {
    const phoneDigits = mapped.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      errors.push(`Row ${rowIndex}: Mobile number "${mapped.phone}" must be 10 digits`);
    }
  }

  // Validate age if provided
  if (mapped.age) {
    const age = parseInt(mapped.age, 10);
    if (isNaN(age) || age < 0 || age > 120) {
      errors.push(`Row ${rowIndex}: Age "${mapped.age}" is not a valid age`);
    }
  }

  return errors;
}
