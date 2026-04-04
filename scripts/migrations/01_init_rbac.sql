-- ================================================================
-- 01_INIT_RBAC.SQL
-- Implement granular Permission-Based Authorization
-- ================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Role-Permissions Mapping Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Create User-Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL, -- References global users (likely from auth.users if using Supabase)
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 5. Seed Initial Roles
INSERT INTO roles (name, description) VALUES
('PATIENT', 'Standard patient user'),
('DOCTOR', 'Medical professional'),
('HOSPITAL_ADMIN', 'Manage hospital staff and patients'),
('PLATFORM_ADMIN', 'Platform-wide analytics and management'),
('SUPER_ADMIN', 'Root access')
ON CONFLICT (name) DO NOTHING;

-- 6. Seed Initial Permissions
INSERT INTO permissions (name, description) VALUES
('BOOK_APPOINTMENT', 'Can book appointment at any hospital'),
('VIEW_OWN_RECORDS', 'Can view their own medical history'),
('VIEW_HOSPITAL_PATIENTS', 'Can view patients within their assigned hospital'),
('MANAGE_DOCTORS', 'Can add/remove doctors in a hospital'),
('MANAGE_HOSPITAL', 'Can edit hospital metadata and billing settings'),
('VIEW_ANALYTICS', 'Can view platform-wide reports'),
('ALL_ACCESS', 'Full system control')
ON CONFLICT (name) DO NOTHING;

-- 7. Assign Permissions to Roles
DO $$
DECLARE
    patient_role_id UUID := (SELECT id FROM roles WHERE name = 'PATIENT');
    doctor_role_id UUID := (SELECT id FROM roles WHERE name = 'DOCTOR');
    hosp_admin_role_id UUID := (SELECT id FROM roles WHERE name = 'HOSPITAL_ADMIN');
    plat_admin_role_id UUID := (SELECT id FROM roles WHERE name = 'PLATFORM_ADMIN');
    super_admin_role_id UUID := (SELECT id FROM roles WHERE name = 'SUPER_ADMIN');

    perm_book UUID := (SELECT id FROM permissions WHERE name = 'BOOK_APPOINTMENT');
    perm_view_own UUID := (SELECT id FROM permissions WHERE name = 'VIEW_OWN_RECORDS');
    perm_view_hosp_pts UUID := (SELECT id FROM permissions WHERE name = 'VIEW_HOSPITAL_PATIENTS');
    perm_manage_docs UUID := (SELECT id FROM permissions WHERE name = 'MANAGE_DOCTORS');
    perm_manage_hosp UUID := (SELECT id FROM permissions WHERE name = 'MANAGE_HOSPITAL');
    perm_view_anal UUID := (SELECT id FROM permissions WHERE name = 'VIEW_ANALYTICS');
    perm_all UUID := (SELECT id FROM permissions WHERE name = 'ALL_ACCESS');
BEGIN
    -- Patient
    INSERT INTO role_permissions VALUES (patient_role_id, perm_book), (patient_role_id, perm_view_own) ON CONFLICT DO NOTHING;
    -- Doctor
    INSERT INTO role_permissions VALUES (doctor_role_id, perm_view_hosp_pts) ON CONFLICT DO NOTHING;
    -- Hospital Admin
    INSERT INTO role_permissions VALUES (hosp_admin_role_id, perm_manage_docs), (hosp_admin_role_id, perm_view_hosp_pts), (hosp_admin_role_id, perm_manage_hosp) ON CONFLICT DO NOTHING;
    -- Platform Admin
    INSERT INTO role_permissions VALUES (plat_admin_role_id, perm_view_anal) ON CONFLICT DO NOTHING;
    -- Super Admin
    INSERT INTO role_permissions VALUES (super_admin_role_id, perm_all) ON CONFLICT DO NOTHING;
END $$;
