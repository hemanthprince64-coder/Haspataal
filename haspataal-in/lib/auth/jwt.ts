
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-dev-secret');

export async function generateToken(user: any) {
    return await new SignJWT({
        user_id: user.id,
        hospital_id: user.hospital_id,
        role: user.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
}
