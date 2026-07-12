import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const code = fs.readFileSync('apps/hospital-hms/lib/services/ipd.ts', 'utf8');
fs.writeFileSync('test_ipd.js', "console.log('OK')");
