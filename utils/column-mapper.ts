export const TARGET_FIELDS = [
  { key: 'name', label: 'Patient Name', required: true },
  { key: 'phone', label: 'Mobile Number', required: false }, // Requires phone OR dob
  { key: 'dob', label: 'Date of Birth / Age', required: false },
  { key: 'gender', label: 'Gender', required: false },
  { key: 'abha_id', label: 'ABHA ID', required: false },
  { key: 'address', label: 'Address', required: false },
];

/**
 * Fuzzy matches uploaded CSV headers to Haspataal target fields.
 */
export function fuzzyMatchHeaders(uploadedHeaders: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};
  
  uploadedHeaders.forEach(header => {
    const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (clean.includes('name') || clean.includes('patient')) {
      mapping[header] = 'name';
    } else if (clean.includes('mob') || clean.includes('phone') || clean.includes('contact')) {
      mapping[header] = 'phone';
    } else if (clean.includes('dob') || clean.includes('birth') || clean.includes('age')) {
      mapping[header] = 'dob';
    } else if (clean.includes('gen') || clean.includes('sex')) {
      mapping[header] = 'gender';
    } else if (clean.includes('abha') || clean.includes('healthid')) {
      mapping[header] = 'abha_id';
    } else if (clean.includes('add') || clean.includes('city')) {
      mapping[header] = 'address';
    } else {
      mapping[header] = null; // Unmapped
    }
  });

  return mapping;
}

/**
 * Validates a single row based on Haspataal business rules.
 */
export function validateRow(row: Record<string, any>, mapping: Record<string, string | null>) {
  const mappedRow: Record<string, any> = {};
  const errors: string[] = [];

  // Apply mapping
  Object.keys(row).forEach(header => {
    const targetKey = mapping[header];
    if (targetKey) {
      mappedRow[targetKey] = row[header];
    }
  });

  // Rule 1: Must have Name
  if (!mappedRow.name || String(mappedRow.name).trim() === '') {
    errors.push('Name is required');
  }

  // Rule 2: Must have Phone OR DOB
  if (!mappedRow.phone && !mappedRow.dob) {
    errors.push('Phone OR DOB is required for uniqueness');
  }

  // Rule 3: Phone format (+91 10-digit)
  if (mappedRow.phone) {
    const phoneStr = String(mappedRow.phone).replace(/\D/g, '');
    // Indian mobile numbers should be 10 digits or 12 with 91 prefix
    if (phoneStr.length < 10 || phoneStr.length > 12) {
      errors.push('Invalid phone number format');
    } else {
      // Normalize to 10 digits for storage
      mappedRow.phone = phoneStr.slice(-10);
    }
  }

  // Rule 4: ABHA ID format
  if (mappedRow.abha_id) {
    const abhaStr = String(mappedRow.abha_id).replace(/[^0-9]/g, '');
    if (abhaStr.length !== 14) {
      errors.push('ABHA ID must be 14 digits');
    }
  }

  return { mappedRow, errors, isValid: errors.length === 0 };
}
