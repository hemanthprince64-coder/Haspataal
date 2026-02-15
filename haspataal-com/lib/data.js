import fs from 'fs';
import path from 'path';

/**
 * Haspataal Mock Database - File Persisted
 * 
 * Uses a shared JSON file in the common directory to sync state 
 * across the 3 separate Next.js processes.
 */

// Available Cities for Location Selection
export const CITIES = [
    { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
    { id: 'delhi', name: 'Delhi', state: 'Delhi NCR' },
    { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
    { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
    { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
    { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
    { id: 'pune', name: 'Pune', state: 'Maharashtra' },
    { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
];

// Initial Seed Data
const SEED_HOSPITALS = [
    { id: 'h1', name: 'City Care Hospital', city: 'Mumbai', area: 'Andheri West', rating: 4.5, status: 'ACTIVE', image: '🏥' },
    { id: 'h2', name: 'LifeLine Medical Center', city: 'Mumbai', area: 'Bandra', rating: 4.7, status: 'ACTIVE', image: '🏥' },
    { id: 'h3', name: 'Sunrise Hospital', city: 'Mumbai', area: 'Borivali', rating: 4.3, status: 'ACTIVE', image: '🏥' },
    { id: 'h4', name: 'Green Valley Clinic', city: 'Delhi', area: 'Dwarka', rating: 4.6, status: 'ACTIVE', image: '🏥' },
    { id: 'h5', name: 'Metro Health Hospital', city: 'Delhi', area: 'Rohini', rating: 4.4, status: 'ACTIVE', image: '🏥' },
    { id: 'h6', name: 'Capital Care Center', city: 'Delhi', area: 'Saket', rating: 4.8, status: 'ACTIVE', image: '🏥' },
    { id: 'h7', name: 'Tech City Hospital', city: 'Bangalore', area: 'Koramangala', rating: 4.5, status: 'ACTIVE', image: '🏥' },
    { id: 'h8', name: 'Garden City Medical', city: 'Bangalore', area: 'Whitefield', rating: 4.6, status: 'ACTIVE', image: '🏥' },
    { id: 'h9', name: 'Pearl City Hospital', city: 'Hyderabad', area: 'Banjara Hills', rating: 4.7, status: 'ACTIVE', image: '🏥' },
    { id: 'h10', name: 'Nizams Healthcare', city: 'Hyderabad', area: 'Jubilee Hills', rating: 4.4, status: 'ACTIVE', image: '🏥' },
    { id: 'h11', name: 'Marina Medical Center', city: 'Chennai', area: 'T. Nagar', rating: 4.5, status: 'ACTIVE', image: '🏥' },
    { id: 'h12', name: 'Sahyadri Hospital', city: 'Pune', area: 'Kothrud', rating: 4.6, status: 'ACTIVE', image: '🏥' },
];

const SEED_USERS = [
    { id: 'u1', mobile: '9999999991', name: 'Admin One', role: 'ADMIN', hospitalId: 'h1', password: '123' },
    { id: 'u2', mobile: '9999999992', name: 'Dr. Priya Sharma', role: 'DOCTOR', hospitalId: 'h1', password: '123', speciality: 'General Physician', experience: 12, fee: 500 },
    { id: 'u3', mobile: '9999999993', name: 'Dr. Rahul Verma', role: 'DOCTOR', hospitalId: 'h1', password: '123', speciality: 'Cardiology', experience: 15, fee: 800 },
    { id: 'u4', mobile: '9999999994', name: 'Dr. Anjali Patel', role: 'DOCTOR', hospitalId: 'h2', password: '123', speciality: 'Dermatology', experience: 8, fee: 600 },
    { id: 'u5', mobile: '9999999995', name: 'Dr. Vikram Singh', role: 'DOCTOR', hospitalId: 'h2', password: '123', speciality: 'Orthopedics', experience: 18, fee: 900 },
    { id: 'u6', mobile: '9999999996', name: 'Dr. Neha Gupta', role: 'DOCTOR', hospitalId: 'h3', password: '123', speciality: 'Gynecology', experience: 10, fee: 700 },
    { id: 'u7', mobile: '8888888881', name: 'Admin Two', role: 'ADMIN', hospitalId: 'h4', password: '123' },
    { id: 'u8', mobile: '8888888882', name: 'Dr. Amit Kumar', role: 'DOCTOR', hospitalId: 'h4', password: '123', speciality: 'Pediatrics', experience: 14, fee: 550 },
    { id: 'u9', mobile: '8888888883', name: 'Dr. Sunita Rao', role: 'DOCTOR', hospitalId: 'h4', password: '123', speciality: 'ENT', experience: 9, fee: 500 },
    { id: 'u10', mobile: '8888888884', name: 'Dr. Rajesh Kapoor', role: 'DOCTOR', hospitalId: 'h5', password: '123', speciality: 'Neurology', experience: 20, fee: 1200 },
    { id: 'u11', mobile: '8888888885', name: 'Dr. Meera Joshi', role: 'DOCTOR', hospitalId: 'h6', password: '123', speciality: 'General Physician', experience: 7, fee: 450 },
    { id: 'u12', mobile: '7777777771', name: 'Dr. Arun Reddy', role: 'DOCTOR', hospitalId: 'h7', password: '123', speciality: 'Cardiology', experience: 16, fee: 850 },
    { id: 'u13', mobile: '7777777772', name: 'Dr. Lakshmi Nair', role: 'DOCTOR', hospitalId: 'h7', password: '123', speciality: 'Dermatology', experience: 11, fee: 650 },
    { id: 'u14', mobile: '7777777773', name: 'Dr. Karthik Iyer', role: 'DOCTOR', hospitalId: 'h8', password: '123', speciality: 'Orthopedics', experience: 13, fee: 750 },
    { id: 'u15', mobile: '6666666661', name: 'Dr. Sanjay Reddy', role: 'DOCTOR', hospitalId: 'h9', password: '123', speciality: 'General Physician', experience: 10, fee: 400 },
    { id: 'u16', mobile: '6666666662', name: 'Dr. Padma Devi', role: 'DOCTOR', hospitalId: 'h9', password: '123', speciality: 'Gynecology', experience: 15, fee: 700 },
    { id: 'u17', mobile: '6666666663', name: 'Dr. Venkat Rao', role: 'DOCTOR', hospitalId: 'h10', password: '123', speciality: 'Pediatrics', experience: 12, fee: 500 },
    { id: 'u18', mobile: '5555555551', name: 'Dr. Ravi Shankar', role: 'DOCTOR', hospitalId: 'h11', password: '123', speciality: 'ENT', experience: 9, fee: 550 },
    { id: 'u19', mobile: '5555555552', name: 'Dr. Priya Rajan', role: 'DOCTOR', hospitalId: 'h11', password: '123', speciality: 'General Physician', experience: 8, fee: 400 },
    { id: 'u20', mobile: '4444444441', name: 'Dr. Suresh Patil', role: 'DOCTOR', hospitalId: 'h12', password: '123', speciality: 'Cardiology', experience: 17, fee: 900 },
    { id: 'u21', mobile: '4444444442', name: 'Dr. Anita Kulkarni', role: 'DOCTOR', hospitalId: 'h12', password: '123', speciality: 'Neurology', experience: 14, fee: 1000 },
];

const SEED_GLOBAL_PATIENTS = [
    { id: 'gp1', mobile: '7777777777', city: 'Mumbai' }
];

const SEED_HOSPITAL_PATIENTS = [
    { id: 'hp1', globalId: 'gp1', hospitalId: 'h1', name: 'Rahul Kumar', age: 30, gender: 'M', mobile: '7777777777' }
];

const SEED_VISITS = [
    { id: 'v1', hospitalId: 'h1', doctorId: 'u2', patientId: 'hp1', date: '2026-02-04T10:00:00', status: 'COMPLETED' },
    { id: 'v2', hospitalId: 'h1', doctorId: 'u3', patientId: 'hp1', date: '2026-02-10T11:00:00', status: 'SCHEDULED' },
];

const SEED_REVIEWS = [
    { id: 'r1', hospitalId: 'h1', patientMobile: '7777777777', rating: 5, comment: 'Excellent care and timely service. Dr. Priya was very thorough.', date: '2026-02-05' },
    { id: 'r2', hospitalId: 'h1', patientMobile: '8888888881', rating: 4, comment: 'Good hospital, clean facilities. Wait time could be less.', date: '2026-02-06' },
    { id: 'r3', hospitalId: 'h2', patientMobile: '7777777777', rating: 5, comment: 'Best dermatology department in the city.', date: '2026-02-03' },
    { id: 'r4', hospitalId: 'h4', patientMobile: '9999999991', rating: 4, comment: 'Friendly staff and great pediatric care.', date: '2026-02-07' },
    { id: 'r5', hospitalId: 'h7', patientMobile: '7777777777', rating: 5, comment: 'State of the art facilities.', date: '2026-02-08' },
    { id: 'r6', hospitalId: 'h9', patientMobile: '8888888882', rating: 4, comment: 'Very professional team. Highly recommend.', date: '2026-02-09' },
];

// Path to the shared database file - needs to be absolute or relative to where processes run
// We'll use a hardcoded path relative to the project root for this specific user workspace
const DB_PATH = path.resolve(process.cwd(), '../common/db.json');

function loadDb() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error loading DB:", error);
    }

    // Default/Seed state if file doesn't exist
    return {
        hospitals: [...SEED_HOSPITALS],
        users: [...SEED_USERS],
        globalPatients: [...SEED_GLOBAL_PATIENTS],
        hospitalPatients: [...SEED_HOSPITAL_PATIENTS],
        visits: [...SEED_VISITS],
        reviews: [...SEED_REVIEWS],
        approved_hospitals: SEED_HOSPITALS.filter(h => h.status === 'ACTIVE').map(h => h.id)
    };
}

// Initialize Global Store
global.mockDb = global.mockDb || loadDb();
export const db = global.mockDb;

// Persist only when modified
export const saveDb = () => {
    try {
        // Ensure directory exists
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error("Error saving DB:", error);
    }
};

// Initial save to create the file if it doesn't exist
saveDb();
