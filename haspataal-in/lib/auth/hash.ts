
import bcrypt from 'bcryptjs'; // Using bcryptjs for broader compatibility if needed, or bcrypt as requested. 
// The user asked for 'bcrypt', but 'bcryptjs' is often safer for cross-platform without compilation.
// Checking package.json... user asked for npm install bcrypt. I will stick to bcrypt if installed, or bcryptjs if that was in the previous file.
// Actually, previous package.json had 'bcryptjs'. The user prompt says 'npm install bcrypt'.
// I will use 'bcrypt' as requested but if it fails on Windows I might need 'bcryptjs'.
// Let's use 'bcrypt' as requested.

import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string) {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return compare(password, hash);
}
