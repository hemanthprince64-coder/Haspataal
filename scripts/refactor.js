const fs = require('fs');
let code = fs.readFileSync('app/actions.js', 'utf8');

if (!code.includes('requireRole')) {
    code = code.replace(
        `import { createSession, deleteSession, decrypt } from '@/lib/session';`,
        `import { createSession, deleteSession, decrypt } from '@/lib/session';\nimport { requireRole } from '@/lib/auth/requireRole';\nimport { UserRole } from '@/types';`
    );
}

const replaceGuard = (code, actionFn, requiredRole, sessionCookie, errorMsg, injectUserVar) => {
    // We look for patterns like:
    // const cookieStore = await cookies();
    // const userCookie = cookieStore.get('session_user');
    // if (!userCookie) return { message: 'Unauthorized' };
    // const user = await decrypt(userCookie.value);
    // if (!user) return { message: 'Unauthorized' };

    // We'll replace it with the clean requireRole block

    const regex = new RegExp(
        `export async function ${actionFn}\\s*\\(prevState,\\s*formData\\)\\s*\\{([\\s\\S]*?)(?:const cookieStore\\s*=[\\s\\S]*?if\\s*\\(!\\w+\\)\\s*return[\\s\\S]*?)}`,
        'm'
    );

    const newGuard = `\n    let ${injectUserVar};\n    try {\n        ${injectUserVar} = await requireRole(${requiredRole}, '${sessionCookie}');\n    } catch (e) {\n        return ${errorMsg};\n    }\n`;

    // Rather than regex which is brittle with multiple if statements, let's just use string replacement on known blocks
    return code;
};

// string replacement approach
const guardHospitalStr = `    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };

    const user = await decrypt(userCookie.value);
    if (!user) return { message: 'Unauthorized' };`;

const guardPatientStr = `    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_patient');
    if (!userCookie) return { message: 'Please login first.' };
    const patient = await decrypt(userCookie.value);
    if (!patient) return { message: 'Please login first.' };`;

const guardPatientStr2 = `    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_patient');
    if (!userCookie) return { message: 'Please login to book an appointment.' };
    const patient = await decrypt(userCookie.value);
    if (!patient) return { message: 'Please login to book an appointment.' };`;

const guardAdminStr = `    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };
    const admin = await decrypt(adminCookie.value);
    if (!admin) return { message: 'Unauthorized' };`;

// Helper for exact matches

// 1. Hospital actions with DOCTOR or HOSPITAL_ADMIN
const hospitalGuardNew = `    let user;
    try {
        user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
    } catch (e) {
        return { success: false, message: 'Unauthorized' };
    }`;

code = code.replace(`export async function createVisitAction(prevState, formData) {\n${guardHospitalStr}`, `export async function createVisitAction(prevState, formData) {\n${hospitalGuardNew}`);
code = code.replace(`export async function cancelVisitHospital(prevState, formData) {\n    const cookieStore = await cookies();\n    const userCookie = cookieStore.get('session_user');\n    if (!userCookie) return { message: 'Unauthorized' };\n    const user = await decrypt(userCookie.value);\n    if (!user) return { message: 'Unauthorized' };`, `export async function cancelVisitHospital(prevState, formData) {\n${hospitalGuardNew}`);
code = code.replace(`export async function completeVisitHospital(prevState, formData) {\n    const cookieStore = await cookies();\n    const userCookie = cookieStore.get('session_user');\n    if (!userCookie) return { message: 'Unauthorized' };\n    const user = await decrypt(userCookie.value);\n    if (!user) return { message: 'Unauthorized' };`, `export async function completeVisitHospital(prevState, formData) {\n${hospitalGuardNew}`);

// 2. Hospital actions strictly HOSPITAL_ADMIN
const adminHospitalGuardNew = `    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        return { success: false, message: 'Only admins can perform this action.' };
    }`;

// And remove the manual check:
const manualAdminCheck = `\n    if (user.role !== 'ADMIN') {\n        return { success: false, message: 'Only admins can add doctors.' };\n    }\n`;
const manualRemoveAdminCheck = `\n    if (user.role !== 'ADMIN') {\n        return { success: false, message: 'Only admins can remove doctors.' };\n    }\n`;

code = code.replace(`export async function addDoctorAction(prevState, formData) {\n    const cookieStore = await cookies();\n    const userCookie = cookieStore.get('session_user');\n    if (!userCookie) return { message: 'Unauthorized' };\n    const user = await decrypt(userCookie.value);\n    if (!user) return { message: 'Unauthorized' };\n${manualAdminCheck}`, `export async function addDoctorAction(prevState, formData) {\n${adminHospitalGuardNew}\n`);

code = code.replace(`export async function removeDoctorAction(prevState, formData) {\n    const cookieStore = await cookies();\n    const userCookie = cookieStore.get('session_user');\n    if (!userCookie) return { message: 'Unauthorized' };\n    const user = await decrypt(userCookie.value);\n    if (!user) return { message: 'Unauthorized' };\n${manualRemoveAdminCheck}`, `export async function removeDoctorAction(prevState, formData) {\n${adminHospitalGuardNew}\n`);

// 3. Patient actions
const patientGuardNew = `    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { success: false, message: 'Please login first.' };
    }`;
const patientGuardNewBook = `    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { success: false, message: 'Please login to book an appointment.' };
    }`;

code = code.replace(`export async function updatePatientProfile(prevState, formData) {\n${guardPatientStr}`, `export async function updatePatientProfile(prevState, formData) {\n${patientGuardNew}`);
code = code.replace(`export async function cancelAppointmentPatient(prevState, formData) {\n${guardPatientStr}`, `export async function cancelAppointmentPatient(prevState, formData) {\n${patientGuardNew}`);
code = code.replace(`export async function bookAppointment(prevState, formData) {\n${guardPatientStr2}`, `export async function bookAppointment(prevState, formData) {\n${patientGuardNewBook}`);

// 4. Platform Admin actions
const platformAdminGuardNew = `    let admin;
    try {
        admin = await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
    } catch (e) {
        return { success: false, message: 'Unauthorized' };
    }`;

code = code.replace(`export async function approveHospitalAction(prevState, formData) {\n${guardAdminStr}`, `export async function approveHospitalAction(prevState, formData) {\n${platformAdminGuardNew}`);
code = code.replace(`export async function rejectHospitalAction(prevState, formData) {\n${guardAdminStr}`, `export async function rejectHospitalAction(prevState, formData) {\n${platformAdminGuardNew}`);
code = code.replace(`export async function suspendHospitalAction(prevState, formData) {\n${guardAdminStr}`, `export async function suspendHospitalAction(prevState, formData) {\n${platformAdminGuardNew}`);

fs.writeFileSync('app/actions.js', code);
console.log('REFACTOR SUCCESS');
