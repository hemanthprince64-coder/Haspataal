import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "user_profiles" CASCADE;');
    console.log("successfully dropped user_profiles");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
