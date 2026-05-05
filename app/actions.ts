'use server';

import { services } from '@/lib/services';
import { CareLifecycleService } from '@/lib/services/care-lifecycle';
import { z } from 'zod';
import logger from '@/lib/logger';
import { withErrorMonitoring } from '@/lib/monitoring';

import {
  RegisterDoctorSchema,
  RegisterAgentSchema,
  RegisterHospitalSchema,
  RegisterLabSchema,
  BookAppointmentSchema,
  PasswordSchema,
  MobileSchema,
} from '@/lib/validations';

// ── Result Types ─────────────────────────────────────────────

type ActionResult = {
  success?: boolean;
  message?: string;
  data?: unknown;
  result?: unknown;
  error?: string;
  retryAfter?: number;
};

// ── Imports ──────────────────────────────────────────────────

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSession, deleteSession, decrypt } from '@/lib/session';
import { requireRole } from '../lib/auth/requireRole';
import { UserRole } from '../types';
import { withRateLimit } from '@/lib/rate-limit';

// ==================== PLATFORM ACTIONS ====================

export async function searchDoctorsAction(
  city: string,
  speciality?: string,
  query?: string,
): Promise<any[]> {
  try {
    return await services.platform.searchDoctors(city, speciality, query);
  } catch (e: any) {
    logger.error({ action: 'search_doctors_failed', city, speciality, query, error: e.message });
    return [];
  }
}

export async function getCitiesAction() {
  return services.platform.getCities();
}

export async function getAllSpecialitiesAction(): Promise<any[]> {
  try {
    return await services.platform.getAllSpecialities();
  } catch (e: any) {
    logger.error({ action: 'get_specialities_failed', error: e.message });
    return [];
  }
}

// ==================== HOSPITAL ACTIONS ====================

async function _loginHospital(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  const password = formData.get('password') as string;

  // ✅ Validate mobile format
  const mobileParse = MobileSchema.safeParse(mobile);
  if (!mobileParse.success) {
    return {
      success: false,
      message: 'Mobile number must be at least 10 digits',
    };
  }

  if (!mobile || !password) {
    return { message: 'Please enter both mobile and password.' };
  }

  const result = await services.hospital.login(mobile, password);

  if (!result) {
    return { message: 'Invalid credentials.' };
  }

  await createSession('session_user', result);
  redirect('/hospital/dashboard');
}

export const loginHospital = withRateLimit(_loginHospital, {
  actionName: 'loginHospital',
  limit: 10,
  windowSeconds: 15 * 60, // 15 mins
});

async function _registerHospital(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const data = {
      hospitalName: formData.get('hospitalName') as string,
      city: formData.get('city') as string,
      adminName: formData.get('adminName') as string,
      mobile: formData.get('mobile') as string,
      password: formData.get('password') as string,
    };

    // ✅ Validate all required fields using RegisterHospitalSchema
    const validation = RegisterHospitalSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    // ✅ Register hospital and get the returned hospital object
    const hospital = await services.hospital.register(data);

    // ✅ Create session automatically
    const result = {
      user: {
        id: hospital.id,
        name: hospital.legalName,
        role: UserRole.HOSPITAL_ADMIN,
        hospitalId: hospital.id,
      },
    };
    await createSession('session_user', result);

    // ✅ Redirect to setup wizard instead of showing success page
    redirect('/hospital/dashboard/setup');

    // Return never reached due to redirect, but TypeScript requires it
    return { success: true, message: 'Registration successful' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Registration failed.' };
  }
}

export const registerHospital = withRateLimit(_registerHospital, {
  actionName: 'registerHospital',
  limit: 3,
  windowSeconds: 60 * 60, // 1 hour
});

export async function logoutHospital() {
  await deleteSession('session_user');
  redirect('/hospital/login');
}

export async function createVisitAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const visitData = {
      doctorId: formData.get('doctorId') as string,
      patientName: formData.get('patientName') as string,
      patientMobile: formData.get('patientMobile') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
      date: new Date().toISOString(),
    };

    if (!visitData.doctorId || !visitData.patientName || !visitData.patientMobile) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    await services.hospital.createVisit(user.hospitalId, visitData);
    return { success: true, message: 'Visit created successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function cancelVisitHospital(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  const visitId = formData.get('visitId');
  return { success: false, message: 'Feature pending migration.' };
}

export async function completeVisitHospital(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  const visitId = formData.get('visitId') as string;
  const notes = formData.get('notes') as string;
  const imageFile = formData.get('prescriptionImage') as File | null;

  if (!visitId || !notes) {
    return { success: false, message: 'Visit ID and Clinical Notes are required for AI analysis.' };
  }

  let imageData = null;
  if (imageFile && imageFile.size > 0) {
    // Convert File to Base64 for processing
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    imageData = {
      mimeType: imageFile.type || 'image/jpeg',
      data: buffer.toString('base64'),
    };
  }

  try {
    await services.ai.processVisit(visitId, notes, imageData);
    return { success: true, message: 'Visit completed and AI care journey generated!' };
  } catch (e: any) {
    return { success: false, message: `Failed to complete visit: ${e.message}` };
  }
}

export async function addDoctorAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Only hospital admins can add doctors.' };
  }

  const doctorData = {
    name: formData.get('name') as string,
    mobile: formData.get('mobile') as string,
    speciality: formData.get('speciality') as string,
    experience: formData.get('experience') as string,
    fee: formData.get('fee') as string,
    password: (formData.get('password') as string) || '123',
    qualifications: formData.get('qualifications') as string,
    schedule: formData.get('schedule') as string,
  };

  if (!doctorData.name || !doctorData.mobile || !doctorData.speciality) {
    return { success: false, message: 'Name, mobile, and speciality are required.' };
  }

  await services.hospital.addDoctor(user.hospitalId, doctorData);
  return { success: true, message: `Dr. ${doctorData.name} added successfully!` };
}

export async function removeDoctorAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Only hospital admins can remove doctors.' };
  }

  const doctorId = formData.get('doctorId') as string;

  if (!doctorId || typeof doctorId !== 'string') {
    return { success: false, message: 'Invalid doctor ID provided.' };
  }

  try {
    await services.hospital.removeDoctor(user.hospitalId, doctorId);
    return { success: true, message: 'Doctor removed successfully.' };
  } catch (e: any) {
    logger.error({ action: 'remove_doctor_failed', error: e.message }, 'Failed to remove doctor');
    return { success: false, message: e.message || 'Failed to remove doctor.' };
  }
}

export async function approveDoctorAffiliationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Only hospital admins can approve doctors.' };
  }

  const doctorId = formData.get('doctorId') as string;
  await services.hospital.approveDoctorAffiliation(user.hospitalId, doctorId);
  return { success: true, message: 'Doctor approved successfully.' };
}

export async function getHospitalDashboardData(hospitalId: string) {
  try {
    const [stats, allVisits] = await Promise.all([
      services.hospital.getStats(hospitalId),
      services.hospital.getVisits(hospitalId),
    ]);
    return {
      stats,
      recentVisits: allVisits.slice(0, 5),
    };
  } catch (e: any) {
    console.error('Error fetching hospital dashboard data:', e);
    return {
      stats: {
        todayVisits: 0,
        totalPatients: 0,
        totalDoctors: 0,
        scheduledVisits: 0,
        totalVisits: 0,
        completedVisits: 0,
      },
      recentVisits: [],
    };
  }
}

export async function getLabDashboardData(hospitalId: string) {
  try {
    const [catalog, orders] = await Promise.all([
      services.hospital.getDiagnosticCatalog(hospitalId),
      services.hospital.getLabOrders(hospitalId),
    ]);
    return { catalog, orders };
  } catch (e: any) {
    console.error('Error fetching lab dashboard data:', e);
    return { catalog: [], orders: [] };
  }
}

export async function rejectDoctorAffiliationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
  } catch (e: any) {
    return { success: false, message: 'Only hospital admins can reject doctors.' };
  }

  const doctorId = formData.get('doctorId') as string;
  await services.hospital.rejectDoctorAffiliation(user.hospitalId, doctorId);
  return { success: true, message: 'Doctor rejected successfully.' };
}

export async function getAdminDashboardData() {
  try {
    await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
    const stats = await services.admin.getPlatformStats();
    return { stats };
  } catch (e: any) {
    console.error('Error fetching admin dashboard data:', e);
    return {
      stats: {
        totalHospitals: 0,
        activeHospitals: 0,
        pendingHospitals: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalVisits: 0,
        cities: 0,
      },
    };
  }
}

export async function getAgentDashboardData(agentId?: string) {
  try {
    const user = await requireRole(UserRole.AGENT, 'session_agent');
    const data = await services.agent.getDashboardData(user.id);
    return data;
  } catch (e: any) {
    console.error('Error fetching agent dashboard data:', e);
    return {
      hospitals: [],
      patients: [],
      stats: { totalHospitals: 0, approvedHospitals: 0, totalPatients: 0 },
    };
  }
}

async function _registerDoctor(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const data = {
      fullName: formData.get('fullName') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      registrationNumber: formData.get('registrationNumber') as string,
      councilName: formData.get('councilName') as string,
    };

    if (
      !data.fullName ||
      !data.mobile ||
      !data.email ||
      !data.registrationNumber ||
      !data.password
    ) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const pwdCheck = PasswordSchema.safeParse(data.password);
    if (!pwdCheck.success) {
      const firstError = pwdCheck.error.issues[0];
      return { success: false, message: firstError.message };
    }

    await services.doctor.register(data);
    return {
      success: true,
      message: 'Doctor registered successfully! Complete your KYC inside the dashboard.',
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Registration failed.' };
  }
}

export const registerDoctor = withRateLimit(_registerDoctor, {
  actionName: 'registerDoctor',
  limit: 5,
  windowSeconds: 60 * 60, // 1 hour
});

async function _registerAgent(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const data = {
      fullName: formData.get('fullName') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      area: formData.get('area') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
    };

    if (!data.fullName || !data.mobile || !data.email || !data.password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const pwdCheck = PasswordSchema.safeParse(data.password);
    if (!pwdCheck.success) {
      const firstError = pwdCheck.error.issues[0];
      return { success: false, message: firstError.message };
    }

    await services.agent.register(data);
    return {
      success: true,
      message: 'Agent registered successfully! Partner approval is pending.',
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Registration failed.' };
  }
}

export const registerAgent = withRateLimit(_registerAgent, {
  actionName: 'registerAgent',
  limit: 5,
  windowSeconds: 60 * 60, // 1 hour
});

async function _registerLab(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const data = {
      labName: formData.get('labName') as string,
      city: formData.get('city') as string,
      adminName: formData.get('adminName') as string,
      mobile: formData.get('mobile') as string,
      password: formData.get('password') as string,
      registrationNumber: formData.get('registrationNumber') as string,
    };

    if (!data.labName || !data.city || !data.adminName || !data.mobile || !data.password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const pwdCheck = PasswordSchema.safeParse(data.password);
    if (!pwdCheck.success) {
      const firstError = pwdCheck.error.issues[0];
      return { success: false, message: firstError.message };
    }

    await services.hospital.registerLab(data);
    return {
      success: true,
      message: 'Lab registered successfully! Account is pending admin approval.',
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Registration failed.' };
  }
}

export const registerLab = withRateLimit(_registerLab, {
  actionName: 'registerLab',
  limit: 3,
  windowSeconds: 60 * 60, // 1 hour
});

async function _agentLogin(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  const password = formData.get('password') as string;

  if (!mobile || !password) {
    return { message: 'Please enter mobile number and password.' };
  }

  try {
    const result = await services.agent.login(mobile, password);
    await createSession('session_agent', {
      ...result,
      user: { ...result.user, role: result.user.role as UserRole },
    });
  } catch (e: any) {
    return { message: e.message || 'Login failed.' };
  }

  redirect('/agent/dashboard');
}

export const agentLogin = withRateLimit(_agentLogin, {
  actionName: 'agentLogin',
  limit: 10,
  windowSeconds: 15 * 60, // 15 mins
});

// ==================== PATIENT ACTIONS ====================

async function _patientLogin(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  const otp = formData.get('otp') as string;

  if (!mobile || !otp) {
    return { message: 'Please enter mobile number and OTP.' };
  }

  try {
    const result = await services.patient.login(mobile, otp);
    if (!result) {
      return { message: 'Login failed due to an unknown error.' };
    }
    await createSession('session_patient', result);
  } catch (e: any) {
    return { message: e.message || 'Login failed.' };
  }

  redirect('/');
}

export const patientLogin = withRateLimit(_patientLogin, {
  actionName: 'patientLogin',
  limit: 10,
  windowSeconds: 15 * 60, // 15 mins
});

export async function requestOtpAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  if (!mobile || (mobile as string).length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  try {
    await services.patient.requestOtp(mobile);
    return { success: true, message: 'OTP sent successfully!' };
  } catch (e: any) {
    logger.error(
      { action: 'otp_request_failed', mobile, error: e.message, stack: e.stack },
      'Failed to send OTP',
    );
    return { success: false, message: `Failed to send OTP: ${e.message}` };
  }
}

export async function patientRegister(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const data = {
    mobile: formData.get('mobile') as string,
    name: formData.get('name') as string,
    age: formData.get('age') as string,
    gender: formData.get('gender') as string,
    bloodGroup: formData.get('bloodGroup') as string,
    city: formData.get('city') as string,
    email: formData.get('email') as string,
  };

  if (!data.mobile || !data.name) {
    return { message: 'Mobile number and name are required.' };
  }

  const result = await services.patient.register(data);
  await createSession('session_patient', result);

  return { success: true, message: 'Profile saved successfully!' };
}

export async function patientLogout() {
  await deleteSession('session_patient');
  redirect('/login');
}

export async function getPatientFullProfile() {
  try {
    const patientCookie = await requireRole(UserRole.PATIENT, 'session_patient');
    const patientData = await services.patient.getById(patientCookie.id);

    if (!patientData) return null;

    // Fetch all related health details
    const results = await Promise.allSettled([
      services.patient.getFamilyMembers(patientCookie.id),
      services.patient.getMedicalHistory(patientCookie.id),
      services.patient.getMedications(patientCookie.id),
      services.patient.getVitals(patientCookie.id),
      services.patient.getVaccinations(patientCookie.id),
      services.patient.getPregnancyProfile(patientCookie.id),
      services.patient.getInsurance(patientCookie.id),
      services.patient.getAddresses(patientCookie.id),
      services.patient.getWallet(patientCookie.id),
      services.patient.getPrescriptions(patientCookie.id),
      services.patient.getVisits(patientCookie.id),
    ]);

    const [
      familyMembers,
      medicalHistory,
      medications,
      vitals,
      vaccinations,
      pregnancyProfile,
      insurance,
      addresses,
      wallet,
      prescriptions,
      visits,
    ] = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      logger.error(
        { action: 'profile_subfetch_failed', index: i, error: r.reason?.message },
        'Sub-fetch during profile load failed',
      );
      return null; // Graceful fallback per sub-section
    });

    return {
      ...patientData,
      familyMembers: familyMembers || [],
      medicalHistory: medicalHistory || null,
      medications: medications || [],
      vitals: vitals || [],
      vaccinations: vaccinations || [],
      pregnancyProfile: pregnancyProfile || null,
      insurance: insurance || [],
      addresses: addresses || [],
      wallet: wallet || { balance: 0, transactions: [] },
      prescriptions: prescriptions || [],
      visits: visits || [],
      appointments: visits || [],
    };
  } catch (e: any) {
    logger.error(
      { action: 'get_patient_profile_failed', error: e.message },
      'Failed to fetch full patient profile',
    );
    return null;
  }
}

import { uploadProfilePhoto } from '@/lib/supabase';

export async function updatePatientProfile(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const updates: any = {
    name: formData.get('name') as string,
    nickname: (formData.get('nickname') as string) || undefined,
    gender: formData.get('gender') as string,
    bloodGroup: formData.get('bloodGroup') as string,
    city: formData.get('city') as string,
    email: formData.get('email') as string,
    dob: formData.get('dob') ? new Date(formData.get('dob') as string) : undefined,
    address: (formData.get('address') as string) || undefined,
    state: (formData.get('state') as string) || undefined,
    country: (formData.get('country') as string) || undefined,
    pincode: (formData.get('pincode') as string) || undefined,
    occupation: (formData.get('occupation') as string) || undefined,
    maritalStatus: (formData.get('maritalStatus') as string) || undefined,
    emergencyContactName: (formData.get('emergencyContactName') as string) || undefined,
    emergencyContactRelation: (formData.get('emergencyContactRelation') as string) || undefined,
    emergencyContactPhone: (formData.get('emergencyContactPhone') as string) || undefined,
    emergencyContactAltPhone: (formData.get('emergencyContactAltPhone') as string) || undefined,
    preferredHospital: (formData.get('preferredHospital') as string) || undefined,
    preferredSpeciality: (formData.get('preferredSpeciality') as string) || undefined,
    preferredDoctor: (formData.get('preferredDoctor') as string) || undefined,
  };

  // Handle Profile Photo File Upload
  const photoFile = formData.get('profilePhotoFile') as File | null;
  if (photoFile && photoFile.size > 0 && photoFile.name) {
    try {
      const uploadedUrl = await uploadProfilePhoto(photoFile, patient.id);
      if (uploadedUrl) updates.profilePhotoUrl = uploadedUrl;
    } catch (e: any) {
      console.error('DEBUG_PHOTO_UPLOAD_ERROR:', e);
      return { message: `Failed to upload profile photo: ${e.message || 'Unknown error'}` };
    }
  } else {
    // Fallback for direct URL input
    updates.profilePhotoUrl = (formData.get('profilePhotoUrl') as string) || undefined;
  }

  // Remove undefined values
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  try {
    const updated = await services.patient.updateProfile(patient.id, updates);
    if (updated) {
      await createSession('session_patient', {
        user: {
          id: updated.id,
          name: updated.name || 'Patient',
          role: UserRole.PATIENT,
          mobile: updated.phone,
          nickname: updated.nickname || undefined,
          profilePhotoUrl: updated.profilePhotoUrl || undefined,
        },
      });
      return { success: true, message: 'Profile updated successfully!' };
    }
  } catch (error: any) {
    console.error('DEBUG_UPDATE_PROFILE_ERROR:', error);
  }

  return { message: 'Failed to update profile.' };
}

// ==================== FAMILY MEMBER ACTIONS ====================

export async function addFamilyMemberAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    name: formData.get('name') as string,
    relation: formData.get('relation') as string,
    dob: (formData.get('dob') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    bloodGroup: (formData.get('bloodGroup') as string) || undefined,
  };

  if (!data.name || !data.relation) {
    return { message: 'Name and relation are required.' };
  }

  await services.patient.addFamilyMember(patient.id, data);
  return { success: true, message: 'Family member added!' };
}

export async function deleteFamilyMemberAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }
  const memberId = formData.get('memberId') as string;
  await services.patient.deleteFamilyMember(patient.id, memberId);
  return { success: true, message: 'Family member removed.' };
}

// ==================== MEDICAL HISTORY ACTIONS ====================

export async function saveMedicalHistoryAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    chronicDiseases: (formData.get('chronicDiseases') as string) || undefined,
    pastIllnesses: (formData.get('pastIllnesses') as string) || undefined,
    surgeries: (formData.get('surgeries') as string) || undefined,
    allergies: (formData.get('allergies') as string) || undefined,
    drugAllergies: (formData.get('drugAllergies') as string) || undefined,
    hospitalizations: (formData.get('hospitalizations') as string) || undefined,
  };

  await services.patient.saveMedicalHistory(patient.id, data);
  return { success: true, message: 'Medical history saved!' };
}

// ==================== MEDICATION ACTIONS ====================

export async function addMedicationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    drugName: formData.get('drugName') as string,
    dose: (formData.get('dose') as string) || undefined,
    frequency: (formData.get('frequency') as string) || undefined,
    startDate: (formData.get('startDate') as string) || undefined,
  };

  if (!data.drugName) {
    return { message: 'Drug name is required.' };
  }

  await services.patient.addMedication(patient.id, data);
  return { success: true, message: 'Medication added!' };
}

export async function deleteMedicationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }
  const medicationId = formData.get('medicationId') as string;
  await services.patient.deleteMedication(patient.id, medicationId);
  return { success: true, message: 'Medication removed.' };
}

// ==================== VITAL ACTIONS ====================

export async function addVitalAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
    height: formData.get('height') ? parseFloat(formData.get('height') as string) : undefined,
    bloodPressure: (formData.get('bloodPressure') as string) || undefined,
    pulse: formData.get('pulse') ? parseInt(formData.get('pulse') as string) : undefined,
    bloodSugar: formData.get('bloodSugar')
      ? parseFloat(formData.get('bloodSugar') as string)
      : undefined,
    spo2: formData.get('spo2') ? parseFloat(formData.get('spo2') as string) : undefined,
    temperature: formData.get('temperature')
      ? parseFloat(formData.get('temperature') as string)
      : undefined,
  };

  await services.patient.addVital(patient.id, data);
  return { success: true, message: 'Vitals recorded!' };
}

// ==================== VACCINATION ACTIONS ====================

export async function addVaccinationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    vaccineName: formData.get('vaccineName') as string,
    dateGiven: (formData.get('dateGiven') as string) || undefined,
    nextDueDate: (formData.get('nextDueDate') as string) || undefined,
  };

  if (!data.vaccineName) {
    return { message: 'Vaccine name is required.' };
  }

  await services.patient.addVaccination(patient.id, data);
  return { success: true, message: 'Vaccination record added!' };
}

// ==================== PREGNANCY PROFILE ACTIONS ====================

export async function savePregnancyProfileAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    lmp: (formData.get('lmp') as string) || undefined,
    edd: (formData.get('edd') as string) || undefined,
    gestationalAge: formData.get('gestationalAge')
      ? parseInt(formData.get('gestationalAge') as string)
      : undefined,
    highRisk: formData.get('highRisk') === 'true',
    ancVisits: formData.get('ancVisits')
      ? parseInt(formData.get('ancVisits') as string)
      : undefined,
    dangerSigns: (formData.get('dangerSigns') as string) || undefined,
    deliveryPlan: (formData.get('deliveryPlan') as string) || undefined,
  };

  await services.patient.savePregnancyProfile(patient.id, data);
  return { success: true, message: 'Pregnancy profile saved!' };
}

// ==================== INSURANCE ACTIONS ====================

export async function saveInsuranceAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    id: (formData.get('insuranceId') as string) || undefined,
    company: formData.get('company') as string,
    policyNumber: (formData.get('policyNumber') as string) || undefined,
    coverageAmount: formData.get('coverageAmount')
      ? parseFloat(formData.get('coverageAmount') as string)
      : undefined,
    expiryDate: (formData.get('expiryDate') as string) || undefined,
  };

  if (!data.company) {
    return { message: 'Insurance company name is required.' };
  }

  await services.patient.saveInsurance(patient.id, data);
  return { success: true, message: 'Insurance details saved!' };
}

export async function deleteInsuranceAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }
  const insuranceId = formData.get('insuranceId') as string;
  await services.patient.deleteInsurance(patient.id, insuranceId);
  return { success: true, message: 'Insurance removed.' };
}

// ==================== APPOINTMENT ACTIONS ====================
export async function getMyAppointmentsAction() {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { success: false, message: 'Please login first.' };
  }
  const visits = await services.patient.getVisits(patient.id);
  return { success: true, data: visits };
}

// ==================== ADDRESS ACTIONS ====================

export async function addAddressAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    type: (formData.get('type') as string) || 'Home',
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: (formData.get('state') as string) || undefined,
    pincode: formData.get('pincode') as string,
    landmark: (formData.get('landmark') as string) || undefined,
    isDefault: formData.get('isDefault') === 'true',
  };

  if (!data.address || !data.city || !data.pincode) {
    return { message: 'Address, city, and pincode are required.' };
  }

  await services.patient.addAddress(patient.id, data);
  return { success: true, message: 'Address saved!' };
}

export async function deleteAddressAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }
  const addressId = formData.get('addressId') as string;
  await services.patient.deleteAddress(patient.id, addressId);
  return { success: true, message: 'Address removed.' };
}

export async function setDefaultAddressAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }
  const addressId = formData.get('addressId') as string;
  await services.patient.setDefaultAddress(patient.id, addressId);
  return { success: true, message: 'Default address updated.' };
}

// ==================== WALLET ACTIONS ====================

export async function addWalletTransactionAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const data = {
    type: formData.get('type') as string, // CREDIT, DEBIT
    amount: parseFloat(formData.get('amount') as string),
    source: formData.get('source') as string, // TOPUP, APPOINTMENT, etc
    description: (formData.get('description') as string) || undefined,
  };

  if (!data.type || !data.amount || !data.source || isNaN(data.amount)) {
    return { message: 'Missing or invalid transaction details.' };
  }
  await services.patient.addWalletTransaction(patient.id, data);
  return { success: true, message: 'Transaction successful!' };
}

// ==================== PRESCRIPTION ACTIONS ====================

export async function uploadPrescriptionAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login first.' };
  }

  const fileUrl = formData.get('fileUrl') as string;
  if (!fileUrl) return { message: 'File URL is required' };

  await services.patient.uploadPrescriptionFile(patient.id, {
    fileUrl,
    notes: (formData.get('notes') as string) || undefined,
    doctorId: (formData.get('doctorId') as string) || undefined,
  });

  return { success: true, message: 'Prescription uploaded!' };
}

export async function logoutPatient() {
  await deleteSession('session_patient');
  redirect('/');
}

export const bookAppointment = withErrorMonitoring(
  'bookAppointment',
  async (
    prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> => {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
  } catch (e: any) {
    return { message: 'Please login to book an appointment.' };
  }

  const doctorId = formData.get('doctorId') as string;
  const hospitalId = formData.get('hospitalId') as string;
  const date = formData.get('date') as string;
  const slot = formData.get('slot') as string;

  if (!doctorId || !hospitalId || !date || !slot) {
    return { success: false, message: 'Please fill in all booking details.' };
  }

  try {
    const payWithWallet = formData.get('payWithWallet') === 'true';
    let assignedStatus = 'BOOKED';

    if (payWithWallet) {
      const wallet = await services.patient.getWallet(patient.id);
      if (wallet.balance < 500) {
        // Assuming 500 consultation fee
        return {
          success: false,
          message: 'Insufficient wallet balance. Please top up your wallet.',
        };
      }
      await services.patient.addWalletTransaction(patient.id, {
        type: 'DEBIT',
        amount: 500,
        source: 'APPOINTMENT',
        description: `Payment for appointment on ${date} at ${slot}`,
      });
      assignedStatus = 'CONFIRMED';
    }

    const visitData = {
      doctorId,
      patientName: patient.name || patient.mobile,
      patientMobile: patient.mobile,
      age: 0,
      gender: 'O',
      date: date,
      slot: slot,
      status: assignedStatus,
    };

    await services.patient.createVisit(hospitalId, visitData);
    return {
      success: true,
      message: payWithWallet
        ? 'Appointment confirmed and paid via wallet!'
        : 'Appointment booked successfully! (Awaiting Payment)',
    };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
});

export async function cancelAppointmentPatient(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let patient;
  try {
    patient = await requireRole(UserRole.PATIENT, 'session_patient');
    const visitId = formData.get('visitId') as string;
    await services.patient.cancelVisit(patient.id, visitId);
    return { success: true, message: 'Appointment cancelled and refund processed.' };
  } catch (e: any) {
    logger.error({ action: 'cancel_appointment_failed', error: e.message }, 'Cancellation failed');
    return { success: false, message: e.message || 'Cannot cancel this appointment.' };
  }
}

export const cancelAppointmentAction = cancelAppointmentPatient;

export async function addReview(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return { success: true, message: 'Reviews are temporarily disabled during upgrade' };
}

// ==================== ADMIN ACTIONS ====================

export async function adminLogin(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { message: 'Please provide username and password.' };
  }

  const result = await services.admin.login(username, password);
  if (!result) {
    return { message: 'Invalid credentials.' };
  }

  await createSession('session_admin', result);
  redirect('/admin/dashboard');
}

export async function logoutAdmin() {
  await deleteSession('session_admin');
  redirect('/admin');
}

export async function approveHospitalAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
  } catch (e: any) {
    return { message: 'Unauthorized' };
  }

  const hospitalId = formData.get('hospitalId') as string;
  await services.admin.approveHospital(hospitalId);

  return { success: true, message: `Hospital approved.` };
}

export async function rejectHospitalAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
  } catch (e: any) {
    return { message: 'Unauthorized' };
  }

  const hospitalId = formData.get('hospitalId') as string;
  await services.admin.rejectHospital(hospitalId);

  return { success: true, message: `Hospital rejected.` };
}

export async function suspendHospitalAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
  } catch (e: any) {
    return { message: 'Unauthorized' };
  }

  const hospitalId = formData.get('hospitalId') as string;
  await services.admin.suspendHospital(hospitalId);

  return { success: true, message: `Hospital suspended.` };
}

export async function getAvailableSlotsAction(doctorId: string, date: string) {
  if (!doctorId || !date) return [];
  try {
    const slots = await services.patient.getAvailableSlots(doctorId, date);
    return slots;
  } catch (error: any) {
    logger.error(
      { action: 'get_available_slots_failed', error: error.message },
      'Failed to get slots',
    );
    return [];
  }
}

// ==================== MEDCHAT AI TRIAGE ====================

import { MedChatInputSchema } from '@/lib/medchat/schemas';
import { triagePatient } from '@/lib/medchat/triage-engine';

export async function medchatTriageAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const rawInput = {
      age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
      gender: formData.get('gender') as string,
      city: formData.get('city') as string,
      duration: formData.get('duration') as string,
      symptoms: formData.get('symptoms') as string,
      fever: formData.get('fever') as string,
      breathingDifficulty: formData.get('breathingDifficulty') as string,
      seizure: formData.get('seizure') as string,
      consciousnessNormal: formData.get('consciousnessNormal') as string,
    };

    const parsed = MedChatInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        message: `Invalid input: ${firstError.path.join('.')} — ${firstError.message}`,
      };
    }

    const result = await triagePatient(parsed.data);

    // Strip internal-only fields from client response
    const { probable_differentials_hidden, risk_score_internal, ...clientResult } = result;

    return { success: true, result: clientResult };
  } catch (e: any) {
    logger.error({ action: 'medchat_triage_failed', error: e.message }, 'MedChat triage error');
    return {
      success: false,
      message: 'An error occurred during symptom analysis. Please try again.',
    };
  }
}

export async function getTopDoctorsBySpeciality(speciality: string, city?: string) {
  try {
    if (!speciality) return [];
    const doctors = await services.platform.searchDoctors(city, speciality);
    return doctors.slice(0, 3).map((doc) => ({
      id: doc.id,
      name: doc.fullName,
      fullName: doc.fullName,
      speciality: speciality,
      hospital: doc.affiliations?.[0]?.hospital?.legalName || 'Haspataal Partner',
      stars: 4.5,
      distance: 'Near you',
    }));
  } catch (e: any) {
    logger.error({ action: 'get_top_doctors_failed', error: e.message });
    return [];
  }
}
// ==================== AI & VISIT ANALYSIS ====================

export async function getVisitAnalysisAction(visitId: string) {
  try {
    const patient = await requireRole(UserRole.PATIENT, 'session_patient');
    return await services.ai.getVisitAnalysisForPatient(patient.id, visitId);
  } catch (e: any) {
    logger.error(
      { action: 'get_visit_analysis_failed', visitId, error: e.message },
      'Failed to fetch visit analysis',
    );
    return null;
  }
}

export async function processVisitAiAction(visitId: string, notes: string) {
  try {
    await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
    return await services.ai.processVisit(visitId, notes);
  } catch (e: any) {
    logger.error(
      { action: 'process_visit_ai_failed', visitId, error: e.message },
      'Failed to process visit AI',
    );
    throw e;
  }
}

// --- Continuous Care Actions ---

export async function getCareTimelineAction(visitId: string) {
  try {
    const patient = await requireRole(UserRole.PATIENT, 'session_patient');
    const state = await CareLifecycleService.getRecoveryStateForPatient(patient.id, visitId);
    if (!state) return null;
    const drift = await CareLifecycleService.analyzeRecoveryDrift(state.journeyId);
    return { ...state, drift };
  } catch (e: any) {
    logger.error({ action: 'get_care_timeline_failed', visitId, error: e.message });
    return null;
  }
}

export async function logMedicationAction(
  careJourneyId: string,
  medName: string,
  schedule: string,
) {
  try {
    const patient = await requireRole(UserRole.PATIENT, 'session_patient');
    return await CareLifecycleService.logMedicationForPatient(
      patient.id,
      careJourneyId,
      medName,
      schedule,
    );
  } catch (e: any) {
    logger.error({ action: 'log_medication_failed', careJourneyId, error: e.message });
    throw e;
  }
}

export async function submitCheckInAction(
  careJourneyId: string,
  dayNumber: number,
  status: string,
) {
  try {
    const patient = await requireRole(UserRole.PATIENT, 'session_patient');
    return await CareLifecycleService.submitCheckInForPatient(
      patient.id,
      careJourneyId,
      dayNumber,
      status as 'BETTER' | 'SAME' | 'WORSE',
    );
  } catch (e: any) {
    logger.error({ action: 'submit_checkin_failed', careJourneyId, error: e.message });
    throw e;
  }
}
// ==================== COMPLIANCE & PRIVACY (DPDP) ====================

export async function recordConsentAction(
  patientId: string,
  purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
) {
  try {
    const session = await decrypt(cookies().get('session_user')?.value);
    if (!session || (session.userId !== patientId && session.role !== 'PLATFORM_ADMIN')) {
      throw new Error('Unauthorized');
    }

    await services.compliance.recordConsent(patientId, purpose);
    return { success: true };
  } catch (e: any) {
    logger.error({ action: 'record_consent_failed', patientId, purpose, error: e.message });
    return { success: false, error: e.message };
  }
}

export async function withdrawConsentAction(
  patientId: string,
  purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
) {
  try {
    const session = await decrypt(cookies().get('session_user')?.value);
    if (!session || (session.userId !== patientId && session.role !== 'PLATFORM_ADMIN')) {
      throw new Error('Unauthorized');
    }

    await services.compliance.withdrawConsent(patientId, purpose);
    return { success: true };
  } catch (e: any) {
    logger.error({ action: 'withdraw_consent_failed', patientId, purpose, error: e.message });
    return { success: false, error: e.message };
  }
}

export async function deletePatientDataAction(patientId: string) {
  // DPDP Right to Erasure is protected by PLATFORM_ADMIN
  const auth = await requireRole(['PLATFORM_ADMIN']);
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    return await services.compliance.deletePatientData(patientId);
  } catch (e: any) {
    logger.error({ action: 'delete_patient_data_failed', patientId, error: e.message });
    return { success: false, error: e.message };
  }
}
