const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Enable RLS on payment_intents
    await prisma.$executeRawUnsafe(`ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;`);

    // Create policy for payment_intents
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Tenant isolation for payment_intents" ON payment_intents
      USING (hospital_id = current_setting('app.current_hospital_id', TRUE));
    `);
    console.log('RLS successfully applied to payment_intents.');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Policy already exists, skipping.');
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
