export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
    DOCTOR: 'DOCTOR',
    RECEPTIONIST: 'RECEPTIONIST',
    PATIENT: 'PATIENT'
};

export const PERMISSIONS = {
    // Hospital Admin Permissions
    MANAGE_HOSPITAL: 'manage_hospital',
    MANAGE_STAFF: 'manage_staff',
    VIEW_ALL_APPOINTMENTS: 'view_all_appointments',
    MANAGE_ALL_APPOINTMENTS: 'manage_all_appointments',

    // Doctor Permissions
    VIEW_OWN_APPOINTMENTS: 'view_own_appointments',
    MANAGE_OWN_SCHEDULE: 'manage_own_schedule',
    VIEW_PATIENT_RECORDS: 'view_patient_records',

    // Receptionist Permissions
    BOOK_APPOINTMENT: 'book_appointment',
    VIEW_ODP: 'view_opd',
    CHECK_IN_PATIENT: 'check_in_patient',
    PROCESS_PAYMENT: 'process_payment',
};

const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

    [ROLES.HOSPITAL_ADMIN]: [
        PERMISSIONS.MANAGE_HOSPITAL,
        PERMISSIONS.MANAGE_STAFF,
        PERMISSIONS.VIEW_ALL_APPOINTMENTS,
        PERMISSIONS.MANAGE_ALL_APPOINTMENTS,
        PERMISSIONS.BOOK_APPOINTMENT,
        PERMISSIONS.VIEW_ODP,
        PERMISSIONS.CHECK_IN_PATIENT,
        PERMISSIONS.PROCESS_PAYMENT
    ],

    [ROLES.DOCTOR]: [
        PERMISSIONS.VIEW_OWN_APPOINTMENTS,
        PERMISSIONS.MANAGE_OWN_SCHEDULE,
        PERMISSIONS.VIEW_PATIENT_RECORDS
    ],

    [ROLES.RECEPTIONIST]: [
        PERMISSIONS.BOOK_APPOINTMENT,
        PERMISSIONS.VIEW_ODP,
        PERMISSIONS.CHECK_IN_PATIENT,
        PERMISSIONS.PROCESS_PAYMENT,
        PERMISSIONS.VIEW_ALL_APPOINTMENTS // usually need to see calendar
    ],

    [ROLES.PATIENT]: [] // Patients have implicit access to their own data
};

export function hasPermission(role, permission) {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}
