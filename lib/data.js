/**
 * Haspataal Mock Database
 * 
 * Simulates a persistent store using in-memory objects.
 * In a real app, this would be Postgres/SQL.
 * 
 * CORE CONSTRAINT: All hospital data must be scoped by hospital_id.
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

// Initial Seed Data - Expanded with more hospitals across cities
const SEED_HOSPITALS = [
    // Mumbai
    { id: 'h1', name: 'City Care Hospital', city: 'Mumbai', area: 'Andheri West', rating: 4.5, status: 'ACTIVE', image: '🏥' },
    { id: 'h2', name: 'LifeLine Medical Center', city: 'Mumbai', area: 'Bandra', rating: 4.7, status: 'ACTIVE', image: '🏥' },
    { id: 'h3', name: 'Sunrise Hospital', city: 'Mumbai', area: 'Borivali', rating: 4.3, status: 'ACTIVE', image: '🏥' },

    // Delhi
    { id: 'h4', name: 'Green Valley Clinic', city: 'Delhi', area: 'Dwarka', rating: 4.6, status: 'ACTIVE', image: '🏥' },
    { id: 'h5', name: 'Metro Health Hospital', city: 'Delhi', area: 'Rohini', rating: 4.4, status: 'ACTIVE', image: '🏥' },
    { id: 'h6', name: 'Capital Care Center', city: 'Delhi', area: 'Saket', rating: 4.8, status: 'ACTIVE', image: '🏥' },

    // Bangalore
    { id: 'h7', name: 'Tech City Hospital', city: 'Bangalore', area: 'Koramangala', rating: 4.5, status: 'ACTIVE', image: '🏥' },
    { id: 'h8', name: 'Garden City Medical', city: 'Bangalore', area: 'Whitefield', rating: 4.6, status: 'ACTIVE', image: '🏥' },

    // Hyderabad
    { id: 'h9', name: 'Pearl City Hospital', city: 'Hyderabad', area: 'Banjara Hills', rating: 4.7, status: 'ACTIVE', image: '🏥' },
    { id: 'h10', name: 'Nizams Healthcare', city: 'Hyderabad', area: 'Jubilee Hills', rating: 4.4, status: 'ACTIVE', image: '🏥' },

    // Chennai
    { id: 'h11', name: 'Marina Medical Center', city: 'Chennai', area: 'T. Nagar', rating: 4.5, status: 'ACTIVE', image: '🏥' },

    // Pune
    { id: 'h12', name: 'Sahyadri Hospital', city: 'Pune', area: 'Kothrud', rating: 4.6, status: 'ACTIVE', image: '🏥' },
];

const SEED_USERS = [
    // Mumbai - City Care Hospital (h1)
    { id: 'u1', mobile: '9999999991', name: 'Admin One', role: 'ADMIN', hospitalId: 'h1', password: '123' },
    { id: 'u2', mobile: '9999999992', name: 'Dr. Priya Sharma', role: 'DOCTOR', hospitalId: 'h1', password: '123', speciality: 'General Physician', experience: 12, fee: 500 },
    { id: 'u3', mobile: '9999999993', name: 'Dr. Rahul Verma', role: 'DOCTOR', hospitalId: 'h1', password: '123', speciality: 'Cardiology', experience: 15, fee: 800 },

    // Mumbai - LifeLine (h2)
    { id: 'u4', mobile: '9999999994', name: 'Dr. Anjali Patel', role: 'DOCTOR', hospitalId: 'h2', password: '123', speciality: 'Dermatology', experience: 8, fee: 600 },
    { id: 'u5', mobile: '9999999995', name: 'Dr. Vikram Singh', role: 'DOCTOR', hospitalId: 'h2', password: '123', speciality: 'Orthopedics', experience: 18, fee: 900 },

    // Mumbai - Sunrise (h3)
    { id: 'u6', mobile: '9999999996', name: 'Dr. Neha Gupta', role: 'DOCTOR', hospitalId: 'h3', password: '123', speciality: 'Gynecology', experience: 10, fee: 700 },

    // Delhi - Green Valley (h4)
    { id: 'u7', mobile: '8888888881', name: 'Admin Two', role: 'ADMIN', hospitalId: 'h4', password: '123' },
    { id: 'u8', mobile: '8888888882', name: 'Dr. Amit Kumar', role: 'DOCTOR', hospitalId: 'h4', password: '123', speciality: 'Pediatrics', experience: 14, fee: 550 },
    { id: 'u9', mobile: '8888888883', name: 'Dr. Sunita Rao', role: 'DOCTOR', hospitalId: 'h4', password: '123', speciality: 'ENT', experience: 9, fee: 500 },

    // Delhi - Metro Health (h5)
    { id: 'u10', mobile: '8888888884', name: 'Dr. Rajesh Kapoor', role: 'DOCTOR', hospitalId: 'h5', password: '123', speciality: 'Neurology', experience: 20, fee: 1200 },

    // Delhi - Capital Care (h6)
    { id: 'u11', mobile: '8888888885', name: 'Dr. Meera Joshi', role: 'DOCTOR', hospitalId: 'h6', password: '123', speciality: 'General Physician', experience: 7, fee: 450 },

    // Bangalore - Tech City (h7)
    { id: 'u12', mobile: '7777777771', name: 'Dr. Arun Reddy', role: 'DOCTOR', hospitalId: 'h7', password: '123', speciality: 'Cardiology', experience: 16, fee: 850 },
    { id: 'u13', mobile: '7777777772', name: 'Dr. Lakshmi Nair', role: 'DOCTOR', hospitalId: 'h7', password: '123', speciality: 'Dermatology', experience: 11, fee: 650 },

    // Bangalore - Garden City (h8)
    { id: 'u14', mobile: '7777777773', name: 'Dr. Karthik Iyer', role: 'DOCTOR', hospitalId: 'h8', password: '123', speciality: 'Orthopedics', experience: 13, fee: 750 },

    // Hyderabad - Pearl City (h9)
    { id: 'u15', mobile: '6666666661', name: 'Dr. Sanjay Reddy', role: 'DOCTOR', hospitalId: 'h9', password: '123', speciality: 'General Physician', experience: 10, fee: 400 },
    { id: 'u16', mobile: '6666666662', name: 'Dr. Padma Devi', role: 'DOCTOR', hospitalId: 'h9', password: '123', speciality: 'Gynecology', experience: 15, fee: 700 },

    // Hyderabad - Nizams (h10)
    { id: 'u17', mobile: '6666666663', name: 'Dr. Venkat Rao', role: 'DOCTOR', hospitalId: 'h10', password: '123', speciality: 'Pediatrics', experience: 12, fee: 500 },

    // Chennai - Marina (h11)
    { id: 'u18', mobile: '5555555551', name: 'Dr. Ravi Shankar', role: 'DOCTOR', hospitalId: 'h11', password: '123', speciality: 'ENT', experience: 9, fee: 550 },
    { id: 'u19', mobile: '5555555552', name: 'Dr. Priya Rajan', role: 'DOCTOR', hospitalId: 'h11', password: '123', speciality: 'General Physician', experience: 8, fee: 400 },

    // Pune - Sahyadri (h12)
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

// Singleton Store
global.mockDb = global.mockDb || {
    hospitals: [...SEED_HOSPITALS],
    users: [...SEED_USERS],
    globalPatients: [...SEED_GLOBAL_PATIENTS],
    hospitalPatients: [...SEED_HOSPITAL_PATIENTS],
    visits: [...SEED_VISITS],
    reviews: [...SEED_REVIEWS],
    approved_hospitals: SEED_HOSPITALS.filter(h => h.status === 'ACTIVE').map(h => h.id)
};

export const db = global.mockDb;

// Helper to save if we were using a file, for now it's just memory references.
export const saveDb = () => {
    // No-op for memory
};
