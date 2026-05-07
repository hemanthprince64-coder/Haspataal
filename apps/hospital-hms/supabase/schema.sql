
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Hospitals Table
create table hospitals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  created_at timestamptz default now()
);

-- Users Table (Admins, Doctors, Receptionists)
create table users (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id) on delete cascade,
  role text check (role in ('admin','doctor','receptionist')),
  mobile varchar(15) not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Global Patients Table (Unique identity across system)
create table global_patients (
  id uuid primary key default uuid_generate_v4(),
  mobile varchar(15) unique not null,
  name text,
  city text,
  created_at timestamptz default now()
);

-- Hospital Patients Table (Hospital-specific records)
create table hospital_patients (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id) on delete cascade,
  global_patient_id uuid references global_patients(id),
  created_at timestamptz default now()
);

-- Visits Table
create table visits (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id),
  patient_id uuid references hospital_patients(id),
  doctor_id uuid references users(id),
  diagnosis text,
  created_at timestamptz default now()
);

-- Diagnostics Catalog
create table diagnostics_catalog (
  id uuid primary key default uuid_generate_v4(),
  name text,
  category text,
  price numeric
);

-- Diagnostic Orders
create table diagnostic_orders (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid,
  patient_id uuid,
  test_id uuid references diagnostics_catalog(id),
  status text default 'pending' check (status in ('pending', 'sample_collected', 'processing', 'completed')),
  report_url text, -- Store Supabase Storage URL
  created_at timestamptz default now()
);

-- Audit Logs
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid,
  user_id uuid,
  action text,
  target_table text,
  target_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table hospital_patients enable row level security;
alter table visits enable row level security;
alter table diagnostic_orders enable row level security;
alter table audit_logs enable row level security;

-- RLS Policies
-- Policy: Users can only see patients belonging to their hospital
create policy hospital_isolation_policy
on hospital_patients
using (hospital_id = (auth.jwt() ->> 'hospital_id')::uuid);

-- Policy: Users can only see visits belonging to their hospital
create policy visit_isolation_policy
on visits
using (hospital_id = (auth.jwt() ->> 'hospital_id')::uuid);

-- Policy: Audit logs - insert only for users, view only for admins?
-- For MVP: Allow insert for all auth users.
create policy audit_insert_policy
on audit_logs
for insert
with check (auth.role() = 'authenticated');

-- Indexes for Performance
create index idx_visits_hospital on visits(hospital_id);
create index idx_patients_hospital on hospital_patients(hospital_id);
create index idx_users_mobile on users(mobile);
create index idx_audit_hospital on audit_logs(hospital_id);

-- Hospital Applications (Onboarding)
create table hospital_applications (
  id uuid primary key default uuid_generate_v4(),
  hospital_name text not null,
  city text not null,
  contact_person text not null,
  mobile text not null,
  email text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- RLS for Applications (Public insert, Admin view)
alter table hospital_applications enable row level security;

create policy anon_application_insert
on hospital_applications
for insert
with check (true);

create policy admin_application_view
on hospital_applications
for select
using (auth.role() = 'authenticated'); -- Ideally restricted to super admins only via app logic or role check

-- Subscriptions & Payments
create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  duration_days int default 30
);

create table hospital_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id),
  plan_id uuid references subscription_plans(id),
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  start_date timestamptz default now(),
  end_date timestamptz,
  created_at timestamptz default now()
);

create table payment_transactions (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id),
  razorpay_payment_id text not null,
  razorpay_order_id text,
  amount numeric not null,
  status text default 'success',
  created_at timestamptz default now()
);

-- RLS
alter table hospital_subscriptions enable row level security;
alter table payment_transactions enable row level security;

-- Policies
create policy subscription_view_policy
on hospital_subscriptions
for select
using (hospital_id = (auth.jwt() ->> 'hospital_id')::uuid);

create policy transaction_view_policy
on payment_transactions
for select
using (hospital_id = (auth.jwt() ->> 'hospital_id')::uuid);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references hospitals(id),
  user_id uuid, -- Link to user if specific, or null for hospital-wide
  message text not null,
  status text default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy notifications_view_policy
on notifications
for select
using (hospital_id = (auth.jwt() ->> 'hospital_id')::uuid);

-- Analytics Views (Approximation for MVP, Real Mat Views need triggers/cron)
create view analytics_daily_appointments as
select 
  hospital_id, 
  date_trunc('day', created_at) as day, 
  count(*) as count 
from visits 
group by hospital_id, day;

create view analytics_diagnostic_conversion as
select 
  hospital_id,
  count(distinct patient_id) as total_patients,
  count(distinct case when exists (select 1 from diagnostic_orders where patient_id = v.patient_id) then patient_id end) as converted_patients
from visits v
group by hospital_id;
