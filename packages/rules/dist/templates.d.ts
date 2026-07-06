import { Rule } from './types';
export declare class RuleTemplates {
    static getPregnancyTemplate(hospitalId?: string): Rule;
    static getDiabetesRiskTemplate(hospitalId?: string): Rule;
    static getVaccinationReminderTemplate(hospitalId?: string): Rule;
}
