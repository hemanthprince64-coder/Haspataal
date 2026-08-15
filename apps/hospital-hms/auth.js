import { OtpService, OtpPurpose } from '@haspataal/auth';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import prisma from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        mobile: {},
        password: {},
        otp: {},
        role: {}, // 'admin' or 'doctor'
      },
      authorize: async (credentials) => {
        if (!credentials?.mobile) return null;

        const { mobile, password, otp, role } = credentials;

        if (role === 'admin') {
          if (!password) return null;
          const admin = await prisma.hospitalAdmin.findUnique({
            where: { mobile },
            include: { hospital: true },
          });

          if (!admin) return null;

          return {
            id: admin.id,
            name: admin.fullName,
            email: admin.email,
            role: 'admin',
            hospitalId: admin.hospitalId,
          };
        } else if (role === 'doctor') {
          if (!otp) return null;

          // 1. Server-side verification of OTP
          const verifyResult = await OtpService.verifyOtp({
            phone: mobile,
            otp,
            purpose: OtpPurpose.DOCTOR_LOGIN,
          });

          if (!verifyResult.success) {
            return null;
          }

          // 2. Lookup doctor
          const doctor = await prisma.doctorMaster.findUnique({
            where: { mobile },
          });

          if (!doctor) return null;

          // 3. Account status guard
          const status = (
            doctor.account_status ||
            doctor.accountStatus ||
            doctor.status ||
            ''
          ).toLowerCase();
          if (['suspended', 'inactive', 'locked'].includes(status)) {
            return null;
          }

          return {
            id: doctor.id,
            name: doctor.fullName,
            email: doctor.email,
            role: 'doctor',
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.hospitalId = user.hospitalId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.hospitalId = token.hospitalId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
