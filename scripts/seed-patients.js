import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FIRST_NAMES = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Meera', 'Arun', 'Kavita', 'Deepak', 'Nisha', 'Rahul', 'Anjali', 'Suresh', 'Pooja', 'Manish', 'Anita', 'Ravi', 'Sanjay', 'Neha', 'Karan'];
const LAST_NAMES = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Joshi', 'Verma', 'Mehta', 'Nair', 'Iyer', 'Rao', 'Das', 'Bhat', 'Kapoor', 'Mishra', 'Tiwari', 'Pandey', 'Agarwal', 'Chauhan'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];

async function seedPatients() {
    console.log('🌱 Seeding 20 Test Patients...\n');
    let count = 0;
    for (let i = 0; i < 20; i++) {
        try {
            const p = await prisma.patient.create({
                data: {
                    name: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`,
                    phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
                    city: CITIES[i % CITIES.length],
                    password: `patient${i + 1}`,
                    gender: i % 2 === 0 ? 'Male' : 'Female'
                }
            });
            console.log(`  ✅ Patient ${i + 1}: ${FIRST_NAMES[i]} ${LAST_NAMES[i]} (${CITIES[i % CITIES.length]}) ID: ${p.id}`);
            count++;
        } catch (e) {
            console.log(`  ⚠️ Patient ${i + 1}: ${e.message.substring(0, 120)}`);
        }
    }
    console.log(`\n✅ ${count}/20 patients seeded`);
    await prisma.$disconnect();
}

seedPatients();
