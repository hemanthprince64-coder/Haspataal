import { TestTemplateParameter } from '@haspataal/db';

export interface EvaluationResult {
  isCritical: boolean;
  flag: string | null; // e.g. "HIGH", "LOW", "CRITICAL_HIGH", "CRITICAL_LOW", null (Normal)
}

export class CriticalValueEngine {
  public static evaluate(valueStr: string, parameter: TestTemplateParameter): EvaluationResult {
    const value = parseFloat(valueStr);

    // If not a number, we can't easily evaluate numeric ranges
    if (isNaN(value)) {
      return { isCritical: false, flag: null };
    }

    if (parameter.criticalMin !== null && value < parameter.criticalMin) {
      return { isCritical: true, flag: 'CRITICAL_LOW' };
    }
    if (parameter.criticalMax !== null && value > parameter.criticalMax) {
      return { isCritical: true, flag: 'CRITICAL_HIGH' };
    }
    if (parameter.normalMin !== null && value < parameter.normalMin) {
      return { isCritical: false, flag: 'LOW' };
    }
    if (parameter.normalMax !== null && value > parameter.normalMax) {
      return { isCritical: false, flag: 'HIGH' };
    }

    return { isCritical: false, flag: null };
  }
}
