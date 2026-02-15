
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                mobile: { label: "Mobile", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.mobile || !credentials?.password) return null;

                const mobile = credentials.mobile;
                const password = credentials.password;

                // 0. Check Super Admin (Hardcoded for MVP/Month 1)
                if (mobile === '9999999999' && password === 'admin123') {
                    return {
                        id: 'super-admin',
                        name: 'Platform Admin',
                        mobile: mobile,
                        role: 'SUPER_ADMIN'
                    };
                }

                // 1. Check Hospital (Admin)
                const hospital = await prisma.hospital.findUnique({
                    where: { phone: mobile }
                });

                if (hospital && hospital.password === password) {
                    return {
                        id: hospital.id,
                        name: hospital.name,
                        mobile: hospital.phone,
                        role: hospital.role, // Use DB Role (HOSPITAL_ADMIN)
                        hospitalId: hospital.id
                    };
                }

                // 2. Check Patient
                const patient = await prisma.patient.findUnique({
                    where: { phone: mobile }
                });

                if (patient && patient.password === password) {
                    return {
                        id: patient.id,
                        name: patient.name,
                        mobile: patient.phone,
                        role: patient.role // Use DB Role (PATIENT)
                    };
                }

                // 3. Check Doctor (Future)
                // const doctor = await prisma.doctor.findUnique(...)

                return null;
            }
        })
    ],
    pages: {
        signIn: '/login', // Custom login page
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.hospitalId = user.hospitalId;
                token.mobile = user.mobile;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.hospitalId = token.hospitalId;
                session.user.mobile = token.mobile;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || 'super_secret_key_change_me',
});
