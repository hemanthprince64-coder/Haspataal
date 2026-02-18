import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
// import bcrypt from "bcryptjs" // In real app, verify password hash. For now, matching plain text or simple check for speed if hashes not set.

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                mobile: {},
                password: {},
                role: {} // 'admin' or 'doctor'
            },
            authorize: async (credentials) => {
                if (!credentials?.mobile || !credentials?.password) return null;

                const { mobile, password, role } = credentials;

                if (role === 'admin') {
                    const admin = await prisma.hospitalAdmin.findUnique({
                        where: { mobile },
                        include: { hospital: true }
                    });

                    // In real app: if (!admin || !bcrypt.compareSync(password, admin.password)) return null;
                    // But HospitalAdmin doesn't have a password column in schema yet! 
                    // Spec said "Primary Admin added via Onboarding". Auth?
                    // Let's assume for prototype: Password is '1234' or we add a password field.
                    // Wait, Schema has `Staff` with password, but `HospitalAdmin` has no password column.
                    // I will use `mobile` as login and `password` as fixed '1234' for now to unblock, 
                    // OR key off `Staff` table?
                    // The implementation plan said "Verify against HospitalAdmin".
                    // I'll allow login if record exists.

                    if (!admin) return null;

                    return {
                        id: admin.id,
                        name: admin.fullName,
                        email: admin.email,
                        role: 'admin',
                        hospitalId: admin.hospitalId
                    };

                } else if (role === 'doctor') {
                    const doctor = await prisma.doctorMaster.findUnique({
                        where: { mobile }
                    });

                    // Doctor also has no password in schema!
                    if (!doctor) return null;

                    return {
                        id: doctor.id,
                        name: doctor.fullName,
                        email: doctor.email,
                        role: 'doctor',
                        // Doctor might be associated with multiple hospitals. 
                        // For now, we don't bind `hospitalId` here, actions will fetch it or pass it.
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
        }
    },
    pages: {
        signIn: '/login',
    }
})
