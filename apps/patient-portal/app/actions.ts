/* eslint-disable */
'use server';

import { z } from 'zod';

import { cookies } from 'next/headers';
// ── Imports ──────────────────────────────────────────────────

import { redirect } from 'next/navigation';

import logger from '@/lib/logger';
// ==================== MEDCHAT AI TRIAGE ====================

import { MedChatInputSchema } from '@/lib/medchat/schemas';
import { triagePatient } from '@/lib/medchat/triage-engine';
import { withErrorMonitoring } from '@/lib/monitoring';
import { withRateLimit } from '@/lib/rate-limit';
import { services } from '@/lib/services';
import { createSession, deleteSession, decrypt } from '@/lib/session';
import { uploadProfilePhoto } from '@/lib/supabase';
import {
  RegisterDoctorSchema,
  RegisterAgentSchema,
  RegisterHospitalSchema,
  RegisterLabSchema,
  BookAppointmentSchema,
  PasswordSchema,
  MobileSchema,
  ClinicOperationalProfileSchema,
  InternalReferralSchema,
  ConsultantSettlementSchema,
} from '@/lib/validations';

import { requireRole } from '../lib/auth/requireRole';
import { UserRole, SessionUser } from '../types';

// ── Result Types ─────────────────────────────────────────────

type ActionResult = {
  success?: boolean;
  message?: string;
  data?: unknown;
  result?: unknown;
  error?: string;
  retryAfter?: number;
};

const DEFAULT_CONSULTATION_FEE = Number(process.env.DEFAULT_CONSULTATION_FEE || 500);

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
    logger.warn({ action: 'login_hospital_failed', mobile }, 'Invalid hospital login credentials');
    return { message: 'Invalid credentials.' };
  }

  logger.info(
    { action: 'login_hospital_success', mobile, hospitalId: result.user.id },
    'Hospital login successful',
  );
  await createSession('session_user', result);
  redirect('/hospital/dashboard');
}

export const loginHospital = withRateLimit(_loginHospital, {
  actionName: 'loginHospital',
  limit: 10,
  windowSeconds: 15 * 60, // 15 mins
});

async function saveUploadedFile(file: File, bucketName: string): Promise<string> {
  if (!file || file.size === 0 || !file.name) return '';

  // 1. Attempt Supabase upload
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
        upsert: true,
        contentType: file.type,
      });

      if (!error) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return data.publicUrl;
      }
    }
  } catch (e: any) {
    logger.warn(
      { action: 'supabase_upload_failed', error: e.message },
      'Supabase upload failed, using local disk fallback',
    );
  }

  // 2. Local fallback
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (e: any) {
    logger.error({ action: 'file_save_failed', error: e.message }, 'Failed to save uploaded file');
    throw new Error(`Failed to save uploaded file: ${e.message}`);
  }
}

async function _registerHospital(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const approvalDocFile = formData.get('approvalDocument') as File;
    let approvalDocumentUrl = '';
    if (approvalDocFile && approvalDocFile.size > 0) {
      approvalDocumentUrl = await saveUploadedFile(
        approvalDocFile,
        'hospital-registration-documents',
      );
    }

    // Process specialties comma separated or multi-select array
    const specialitiesRaw = formData.get('specialities') as string;
    const specialities = specialitiesRaw
      ? specialitiesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const data = {
      hospitalName: (formData.get('hospitalName') as string) || '',
      city: (formData.get('city') as string) || '',
      adminName: (formData.get('adminName') as string) || '',
      mobile: (formData.get('mobile') as string) || '',
      password: (formData.get('password') as string) || '',
      facilityType: (formData.get('facilityType') as any) || 'HOSPITAL',
      registrationNumber: (formData.get('registrationNumber') as string) || '',
      googleLocationUrl: (formData.get('googleLocationUrl') as string) || undefined,
      medicalCouncilNumber: (formData.get('medicalCouncilNumber') as string) || undefined,
      specialities,
      approvalDocumentUrl: approvalDocumentUrl || '',
    };

    // ✅ Validate all required fields using RegisterHospitalSchema
    const validation = RegisterHospitalSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || 'Validation failed',
      };
    }

    // ✅ Register hospital using extended service
    await services.hospital.register(data);

    // Return success to trigger verification pending screen in UI
    return { success: true, message: 'PENDING_APPROVAL' };
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
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
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
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
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
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const visitId = formData.get('visitId') as string;
  const notes = formData.get('notes') as string;
  const imageFile = formData.get('prescriptionImage') as File | null;

  if (!visitId || !notes) {
    return { success: false, message: 'Visit ID and Clinical Notes are required for AI analysis.' };
  }

  let imageData: { mimeType: string; data: string } | undefined = undefined;
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
  let user: SessionUser;
  try {
    user = (await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user')) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Only hospital admins can add doctors.' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
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
    await services.hospital.removeDoctor(user.hospitalId as string, doctorId);
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
  await services.hospital.approveDoctorAffiliation(user.hospitalId as string, doctorId);
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
  await services.hospital.rejectDoctorAffiliation(user.hospitalId as string, doctorId);
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
      return { success: false, message: firstError?.message || 'Invalid password' };
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
      return { success: false, message: firstError?.message || 'Invalid password' };
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
      return { success: false, message: firstError?.message || 'Invalid password' };
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

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
    if (
      photoFile.size > MAX_PROFILE_PHOTO_SIZE ||
      !ALLOWED_PROFILE_PHOTO_TYPES.has(photoFile.type)
    ) {
      return { message: 'Profile photo must be a JPG, PNG, or WebP image under 2MB.' };
    }

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
  async (prevState: ActionResult | null, formData: FormData): Promise<ActionResult> => {
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
        if (wallet.balance < DEFAULT_CONSULTATION_FEE) {
          return {
            success: false,
            message: 'Insufficient wallet balance. Please top up your wallet.',
          };
        }
        await services.patient.addWalletTransaction(patient.id, {
          type: 'DEBIT',
          amount: DEFAULT_CONSULTATION_FEE,
          source: 'APPOINTMENT',
          description: `Payment for appointment on ${date} at ${slot}`,
        });
        assignedStatus = 'CONFIRMED';
      }

      const visitData = {
        doctorId,
        patientName: String(patient.name || patient.mobile || ''),
        patientMobile: String(patient.mobile || ''),
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
  },
);

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
        message: `Invalid input: ${firstError?.path.join('.') || 'Unknown'} — ${firstError?.message || 'Validation failed'}`,
      };
    }

    const result = (await triagePatient(parsed.data)) as any;

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
      hospital: (doc as any).affiliations?.[0]?.hospital?.legalName || 'Haspataal Partner',
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

// --- Continuous Care Actions (Migrated to Journey Engine) ---
// ==================== COMPLIANCE & PRIVACY (DPDP) ====================

export async function recordConsentAction(
  patientId: string,
  purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
) {
  try {
    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get('session_user')?.value || '');
    if (
      !session ||
      (session.user.id !== patientId && session.user.role !== UserRole.PLATFORM_ADMIN)
    ) {
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
    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get('session_user')?.value || '');
    if (
      !session ||
      (session.user.id !== patientId && session.user.role !== UserRole.PLATFORM_ADMIN)
    ) {
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
  const auth = await requireRole(UserRole.PLATFORM_ADMIN, 'session_user');
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    return await services.compliance.deletePatientData(patientId);
  } catch (e: any) {
    logger.error({ action: 'delete_patient_data_failed', patientId, error: e.message });
    return { success: false, error: e.message };
  }
}

// ==================== ONBOARDING & SETUP ACTIONS ====================

export async function sendRegistrationOtp(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  if (!mobile || mobile.length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  try {
    // Reuses requestOtp logic which generates and saves the OTP in prisma.otpCode
    await services.patient.requestOtp(mobile);
    return { success: true, message: 'OTP sent successfully!' };
  } catch (e: any) {
    return { success: false, message: `Failed to send OTP: ${e.message}` };
  }
}

export async function verifyRegistrationOtp(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  const code = formData.get('code') as string;

  if (!mobile || !code) {
    return { success: false, message: 'Mobile and OTP code are required.' };
  }

  try {
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    const otpRecord = await services.platform.getCities(); // dummy call or direct prisma access since shared
    const prisma = require('@/lib/prisma').default;
    const otp = await prisma.otpCode.findUnique({
      where: { phone: normalizedMobile },
    });

    if (!otp) {
      return { success: false, message: 'OTP has expired or was not requested.' };
    }
    if (otp.code !== code) {
      return { success: false, message: 'Invalid OTP code. Please try again.' };
    }

    return { success: true, message: 'OTP verified successfully!' };
  } catch (e: any) {
    return { success: false, message: `OTP validation failed: ${e.message}` };
  }
}

export async function submitDiscoveryQuestionnaireAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user')) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized. Please log in first.' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  try {
    // Collect data
    const data = {
      isSingleDoctor: formData.get('isSingleDoctor') === 'true',
      hasConsultants: formData.get('hasConsultants') === 'true',
      dailyStaffCount: Number(formData.get('dailyStaffCount') || 1),
      hasReceptionist: formData.get('hasReceptionist') === 'true',
      hasNursingStaff: formData.get('hasNursingStaff') === 'true',
      hasPharmacy: formData.get('hasPharmacy') === 'true',
      hasOwnLab: formData.get('hasOwnLab') === 'true',
      admitsPatients: formData.get('admitsPatients') === 'true',
      avgDailyPatients: Number(formData.get('avgDailyPatients') || 10),
      opdOnly: formData.get('opdOnly') === 'true',
      currentWorkflow: {
        appointments: formData.get('workflowAppointments') as string,
        records: formData.get('workflowRecords') as string,
        billing: formData.get('workflowBilling') as string,
        followups: formData.get('workflowFollowups') as string,
        biggestProblem: formData.get('workflowProblem') as string,
      },
      digitalMaturity: {
        prevSoftware: formData.get('prevSoftware') as string,
        whyStopped: formData.get('whyStopped') as string,
        comfortLevel: formData.get('staffComfort') as string,
        preferredDevice: formData.get('preferredDevice') as string,
        internetReliability: formData.get('internetReliability') as string,
      },
      retentionLeaks: {
        remindersMethod: formData.get('remindersMethod') as string,
        chronicLost: formData.get('chronicLost') as string,
        whatsappOptIn: formData.get('whatsappOptIn') === 'true',
      },
      pharmacyConfig: {
        stockManual: formData.get('stockManual') === 'true',
        expiryTracked: formData.get('expiryTracked') === 'true',
      },
      labConfig: {
        ownLab: formData.get('ownLab') === 'true',
        digitalUpload: formData.get('digitalUpload') === 'true',
      },
      communicationPrefs: {
        whatsappNumber: formData.get('whatsappNumber') as string,
        smsRequired: formData.get('smsRequired') === 'true',
        preferredLanguage: (formData.get('preferredLanguage') as string) || 'English',
        onlineBooking: formData.get('onlineBooking') === 'true',
      },
    };

    // Save profile
    await services.hospitalSetup.saveOperationalProfile(user.hospitalId, data);

    // Auto-configure
    await services.hospitalSetup.autoConfigureClinic(user.hospitalId);

    return { success: true, message: 'Questionnaire submitted and clinic configured!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Submission failed.' };
  }
}

export async function addStaffWithAccessAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user')) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized.' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const name = formData.get('name') as string;
  const mobile = formData.get('mobile') as string;
  const roleStr = formData.get('role') as string;
  const loginNeeded = formData.get('loginNeeded') === 'true';

  if (!name || !mobile || !roleStr) {
    return { success: false, message: 'Name, Mobile, and Role are required.' };
  }

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(mobile, 12); // Default password is the mobile number
    const prisma = require('@/lib/prisma').default;

    await prisma.staff.create({
      data: {
        hospitalId: user.hospitalId,
        name,
        mobile,
        password: hashedPassword,
        role: roleStr as any,
        isActive: true,
      },
    });

    return { success: true, message: 'Staff added successfully!' };
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { success: false, message: 'A staff member with this mobile number already exists.' };
    }
    return { success: false, message: e.message || 'Failed to add staff.' };
  }
}

export async function submitReferralAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const data = {
    patientId: formData.get('patientId') as string,
    fromDoctorId: formData.get('fromDoctorId') as string,
    toDoctorId: formData.get('toDoctorId') as string,
    reason: formData.get('reason') as string,
    priority: (formData.get('priority') as any) || 'ROUTINE',
    notes: formData.get('notes') as string,
  };

  const validation = InternalReferralSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0]?.message || 'Validation failed' };
  }

  try {
    await services.hospital.createReferral(user.hospitalId, data);
    return { success: true, message: 'Internal referral created successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to create referral.' };
  }
}

export async function calculateConsultantPayoutsAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user')) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const doctorId = formData.get('doctorId') as string;
  const startStr = formData.get('settlementPeriodStart') as string;
  const endStr = formData.get('settlementPeriodEnd') as string;

  const validation = ConsultantSettlementSchema.safeParse({
    doctorId,
    settlementPeriodStart: startStr,
    settlementPeriodEnd: endStr,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0]?.message || 'Validation failed' };
  }

  try {
    const settlement = await services.hospital.payoutConsultant(
      user.hospitalId,
      doctorId,
      new Date(startStr),
      new Date(endStr),
    );
    return {
      success: true,
      message: 'Payout settlement generated successfully!',
      data: settlement,
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to calculate settlements.' };
  }
}

export async function advancePatientStageAction(formData: FormData): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const visitId = formData.get('visitId') as string;
  const fromStage = formData.get('fromStage') as any;
  const toStage = formData.get('toStage') as any;
  const staffId = (formData.get('assignedStaffId') as string) || undefined;
  const notes = (formData.get('notes') as string) || undefined;

  if (!visitId || !fromStage || !toStage) {
    return { success: false, message: 'Visit ID and stages are required.' };
  }

  try {
    await services.hospital.handoffPatient(
      visitId,
      user.hospitalId,
      fromStage,
      toStage,
      staffId,
      notes,
    );
    return { success: true, message: `Patient successfully advanced to ${toStage}!` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Handoff failed.' };
  }
}

export async function loginHospitalWithOtp(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const mobile = formData.get('mobile') as string;
  const code = formData.get('otp') as string;

  if (!mobile || !code) {
    return { success: false, message: 'Mobile number and OTP are required.' };
  }

  try {
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    const prisma = require('@/lib/prisma').default;

    // 1. Verify OTP
    const otpRecord = await prisma.otpCode.findUnique({
      where: { phone: normalizedMobile },
    });

    if (!otpRecord) {
      return { success: false, message: 'OTP has expired or was not requested.' };
    }
    if (otpRecord.code !== code) {
      return { success: false, message: 'Invalid OTP code. Please request a new one.' };
    }

    // Prevent replay
    await prisma.otpCode.delete({ where: { id: otpRecord.id } });

    // 2. Find Hospital by Mobile
    // Raw SQL to fetch name and ignored password fields safely
    const hospitals = await prisma.$queryRaw<any[]>`
      SELECT * FROM hospitals_master WHERE contact_number = ${normalizedMobile} LIMIT 1
    `;
    const hospital = hospitals?.[0];

    if (!hospital) {
      return {
        success: false,
        message: 'No clinic found with this mobile number. Please register.',
      };
    }

    // 3. Create Session
    const result = {
      user: {
        id: hospital.id,
        name: hospital.display_name || hospital.legal_name || 'Hospital Admin',
        role: UserRole.HOSPITAL_ADMIN,
        hospitalId: hospital.id,
      },
    };

    logger.info(
      { action: 'magic_login_hospital_success', hospitalId: hospital.id },
      'Hospital Magic Login Successful',
    );
    await createSession('session_user', result as any);
  } catch (e: any) {
    if (e.message && e.message.includes('NEXT_REDIRECT')) throw e;
    return { success: false, message: e.message || 'Login failed.' };
  }

  redirect('/hospital/dashboard');
}

export async function detectClinicTypeAction(): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user')) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized. Please log in first.' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  try {
    const prisma = require('@/lib/prisma').default;
    const profile = await prisma.clinicOperationalProfile.findUnique({
      where: { hospitalId: user.hospitalId },
    });

    if (!profile) {
      return { success: true, data: 'SINGLE_DOCTOR' };
    }

    const clinicType = profile.isSingleDoctor
      ? 'SINGLE_DOCTOR'
      : profile.admitsPatients
        ? 'MULTISPECIALTY_HOSPITAL'
        : 'MULTISPECIALTY_CLINIC';

    return { success: true, data: clinicType };
  } catch (e: any) {
    return { success: false, message: e.message || 'Detection failed.' };
  }
}

export async function verifySetupVerificationAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const method = formData.get('method') as 'password' | 'otp';
  const hospitalId = formData.get('hospitalId') as string;
  const val = formData.get('value') as string;

  if (!hospitalId || !val) {
    return { success: false, message: 'Missing hospital ID or verification code/password.' };
  }

  try {
    const prisma = require('@/lib/prisma').default;
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return { success: false, message: 'Hospital not found.' };
    }

    if (method === 'password') {
      const bcrypt = require('bcryptjs');
      const isPlain =
        !hospital.password?.startsWith('$2b$') && !hospital.password?.startsWith('$2a$');
      const matches = isPlain
        ? hospital.password === val
        : await bcrypt.compare(val, hospital.password);
      if (!matches) {
        return { success: false, message: 'Incorrect account password.' };
      }
    } else {
      // OTP verification
      const normalizedMobile = hospital.contactNumber.replace(/\D/g, '').slice(-10);
      const otpRecord = await prisma.otpCode.findUnique({
        where: { phone: normalizedMobile },
      });

      if (!otpRecord) {
        return { success: false, message: 'OTP has expired or was not requested.' };
      }
      if (otpRecord.code !== val) {
        return { success: false, message: 'Invalid OTP code.' };
      }
      // Delete OTP on success
      await prisma.otpCode.delete({ where: { id: otpRecord.id } });
    }

    return { success: true, message: 'Verified successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Verification failed.' };
  }
}

export async function getGoLiveDashboardDataAction(hospitalId: string): Promise<ActionResult> {
  try {
    const prisma = require('@/lib/prisma').default;
    const [hospital, departments, billingProfile, opdConfig, visits, doctors] = await Promise.all([
      prisma.hospitalsMaster.findUnique({
        where: { id: hospitalId },
        select: { legalName: true, displayName: true, contactNumber: true },
      }),
      prisma.hospitalDepartment.findMany({
        where: { hospitalId },
        select: { id: true, departmentName: true },
      }),
      prisma.hospitalBillingProfile.findUnique({
        where: { hospitalId },
      }),
      prisma.opdConfig.findUnique({
        where: { hospitalId },
      }),
      prisma.visit.findMany({
        where: { hospitalId },
        include: {
          appointment: {
            include: {
              doctor: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId, isCurrent: true, verificationStatus: 'VERIFIED' },
        include: {
          doctor: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        hospital,
        departments,
        billingProfile,
        opdConfig,
        visits: visits.map((v: any) => ({
          id: v.id,
          appointmentId: v.appointmentId,
          patientName: v.patientName,
          patientPhone: v.patientPhone,
          diagnosis: v.diagnosis,
          amount: v.amount,
          createdAt: v.createdAt.toISOString(),
          currentStage: v.currentStage,
          doctorName: v.appointment?.doctor?.fullName || 'N/A',
        })),
        doctors: doctors.map((d: any) => ({
          id: d.doctor.id,
          name: d.doctor.fullName,
          speciality: d.department || 'General Medicine',
          revenueSharePercent:
            d.payload && typeof d.payload === 'object'
              ? (d.payload as any).revenueSharePercent || 70
              : 70,
        })),
      },
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to fetch dashboard data.' };
  }
}

export async function getPatientTimelineEventsAction(
  patientPhone: string,
  hospitalId: string,
): Promise<ActionResult> {
  try {
    const prisma = require('@/lib/prisma').default;
    const patient = await prisma.patient.findUnique({
      where: { phone: patientPhone },
    });
    if (!patient) {
      return { success: true, data: [] };
    }

    const patientId = patient.id;

    const [visits, labOrders, prescriptions, pharmacyDispenses] = await Promise.all([
      prisma.visit.findMany({
        where: { hospitalId, patientPhone },
        include: { appointment: { include: { doctor: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.labOrder.findMany({
        where: { hospitalId, patientId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patientPrescription.findMany({
        where: { patientId, doctor: { affiliations: { some: { hospitalId } } } },
        include: { doctor: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pharmacyDispense.findMany({
        where: { hospitalId, patientId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const events: any[] = [];

    visits.forEach((v: any) => {
      events.push({
        id: `v-opd-${v.id}`,
        date:
          v.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ' ' +
          v.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'opd',
        title: 'Outpatient Consultation',
        subtitle: v.appointment?.doctor?.fullName
          ? `Dr. ${v.appointment.doctor.fullName}`
          : 'Clinic Physician',
        notes: v.diagnosis || 'General check-up',
        details: [
          { label: 'Stage', value: v.currentStage },
          { label: 'Amount Charged', value: `₹${v.amount}` },
        ],
      });

      if (v.currentStage === 'BILLING' || v.amount > 0) {
        events.push({
          id: `v-bill-${v.id}`,
          date:
            v.createdAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }) +
            ' ' +
            v.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: 'billing',
          title: 'OPD Consultation Bill',
          subtitle: 'Billing Desk',
          notes: `Consultation Fee of ₹${v.amount} registered.`,
          details: [
            { label: 'Status', value: v.currentStage === 'BILLING' ? 'Pending Payment' : 'Paid' },
            { label: 'Amount', value: `₹${v.amount}` },
          ],
        });
      }
    });

    labOrders.forEach((lo: any) => {
      events.push({
        id: `lo-${lo.id}`,
        date:
          lo.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ' ' +
          lo.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'lab',
        title: `Laboratory Order #${lo.orderNumber || lo.id.slice(0, 6).toUpperCase()}`,
        subtitle: 'Pathology Lab',
        notes: `Lab status: ${lo.status}`,
        details: [
          { label: 'Status', value: lo.status },
          { label: 'Bill Amount', value: lo.totalAmount ? `₹${lo.totalAmount}` : 'N/A' },
        ],
      });
    });

    prescriptions.forEach((pr: any) => {
      events.push({
        id: `pr-${pr.id}`,
        date:
          pr.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ' ' +
          pr.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'opd',
        title: 'Prescription Issued',
        subtitle: pr.doctor?.fullName ? `Dr. ${pr.doctor.fullName}` : 'Prescribing Doctor',
        notes: pr.notes || 'Medication list prescribed.',
      });
    });

    pharmacyDispenses.forEach((pd: any) => {
      events.push({
        id: `pd-${pd.id}`,
        date:
          pd.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ' ' +
          pd.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'pharmacy',
        title: 'Pharmacy Dispense',
        subtitle: 'In-house Pharmacy',
        notes: `Status: ${pd.status}`,
      });
    });

    return { success: true, data: events };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to fetch timeline.' };
  }
}

export async function registerWalkInVisitAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user: SessionUser;
  try {
    user = (await requireRole(
      [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
      'session_user',
    )) as SessionUser;
  } catch (e: any) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!user.hospitalId) {
    return { success: false, message: 'Hospital context missing.' };
  }

  const patientName = formData.get('patientName') as string;
  const patientMobile = formData.get('patientMobile') as string;
  const doctorId = formData.get('doctorId') as string;

  if (!patientName || !patientMobile) {
    return { success: false, message: 'Patient Name and Mobile number are required.' };
  }

  try {
    const res = await services.hospital.createVisit(user.hospitalId, {
      patientName,
      patientMobile,
      doctorId: doctorId || undefined,
      date: new Date().toISOString(),
    });
    return { success: true, message: 'Walk-in visit created successfully!', data: res };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to create walk-in visit.' };
  }
}

// ── Placeholder for legacy getCareTimelineAction (Wave 9 migration cleanup) ───────────────
export async function getCareTimelineAction(visitId: string) {
  // This was removed during the 9-wave migration.
  // Returning empty data gracefully so the UI can fall back to its empty state.
  return null;
}
