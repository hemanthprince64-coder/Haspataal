import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

let container: StartedPostgreSqlContainer;
let prismaAdmin: PrismaClient;

const HOSP_A = '11111111-1111-1111-1111-111111111111';
const HOSP_B = '22222222-2222-2222-2222-222222222222';
const PAT_A = '33333333-3333-3333-3333-333333333333';
const PAT_B = '44444444-4444-4444-4444-444444444444';
const USER_A = '55555555-5555-5555-5555-555555555555';

async function withRole(hospitalId: string, userId: string, fn: (tx: any) => Promise<any>) {
  return prismaAdmin.$transaction(async (tx) => {
    const claims = JSON.stringify({ role: 'HOSPITAL_ADMIN', hospitalId: hospitalId, sub: userId });
    await tx.$executeRawUnsafe(`SET LOCAL request.jwt.claims = '${claims}'`);
    await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated`);
    try {
      const res = await fn(tx);
      return res;
    } catch (err) {
      throw err;
    } finally {
      try {
        await tx.$executeRawUnsafe(`RESET ROLE`);
        await tx.$executeRawUnsafe(`RESET request.jwt.claims`);
      } catch (resetErr) {
        // ignore reset error if transaction is aborted
      }
    }
  });
}

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  const databaseUrl = container.getConnectionUri();
  
  execSync(
    'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
    { env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl }, stdio: 'ignore' }
  );

  execSync(`npx prisma db execute --url="${databaseUrl}" --stdin`, {
    input: `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN NOINHERIT;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN NOINHERIT;
        END IF;
      END
      $$;
      CREATE SCHEMA IF NOT EXISTS storage;
      CREATE TABLE IF NOT EXISTS storage.buckets (id text PRIMARY KEY, name text);
      CREATE TABLE IF NOT EXISTS storage.objects (id text PRIMARY KEY, bucket_id text, name text);
      CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql AS $f$ SELECT string_to_array(name, '/'); $f$;
    `
  });

  const migrationFiles = [
    'scripts/migrate/phase4_security_rls.sql',
    'scripts/migrate/supabase_security_hardening.sql'
  ];

  for (const file of migrationFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      execSync(`npx prisma db execute --url="${databaseUrl}" --file="${fullPath}"`);
    }
  }

  // Grant EXECUTE to authenticated role since supabase_security_hardening.sql revokes from PUBLIC
  execSync(`npx prisma db execute --url="${databaseUrl}" --stdin`, {
    input: `
      GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
      GRANT EXECUTE ON FUNCTION public.get_user_hospital_id() TO authenticated;
      GRANT EXECUTE ON FUNCTION public.get_user_id() TO authenticated;
      GRANT EXECUTE ON FUNCTION public._jwt_claim_text(text) TO authenticated;
      
      GRANT ALL ON public.visits TO authenticated;
      GRANT ALL ON public.appointments TO authenticated;
      GRANT ALL ON public.doctor_hospital_affiliations TO authenticated;
    `
  });

  prismaAdmin = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  await prismaAdmin.hospitalsMaster.createMany({
    data: [
      { id: HOSP_A, displayName: 'Hospital A', legalName: 'Hospital A', registrationNumber: 'REG-A' },
      { id: HOSP_B, displayName: 'Hospital B', legalName: 'Hospital B', registrationNumber: 'REG-B' },
    ],
  });

  await prismaAdmin.patient.createMany({
    data: [
      { id: PAT_A, name: 'Patient A', phone: '+910000000001', password: 'hash' },
      { id: PAT_B, name: 'Patient B', phone: '+910000000002', password: 'hash' },
    ],
  });

  await prismaAdmin.visit.createMany({
    data: [
      { id: 'visit-A1', hospitalId: HOSP_A, patientName: 'Pat A', patientPhone: '1', amount: 100 },
      { id: 'visit-A2', hospitalId: HOSP_A, patientName: 'Pat A', patientPhone: '1', amount: 200 },
      { id: 'visit-B1', hospitalId: HOSP_B, patientName: 'Pat B', patientPhone: '2', amount: 500 },
    ],
  });
}, 120_000);

afterAll(async () => {
  if (prismaAdmin) await prismaAdmin.$disconnect();
  if (container) await container.stop();
});

describe('Phase 11.4: RLS Tenant Isolation', () => {
  it('1. Hospital A can read Hospital A data', async () => {
    const visits = await withRole(HOSP_A, USER_A, async (tx) => {
      return tx.visit.findMany();
    });
    expect(visits.length).toBe(2);
    expect(visits.every((v: any) => v.hospitalId === HOSP_A)).toBe(true);
  });

  it('2. Hospital A cannot read Hospital B data', async () => {
    const visits = await withRole(HOSP_A, USER_A, async (tx) => {
      return tx.visit.findMany({ where: { hospitalId: HOSP_B } });
    });
    expect(visits.length).toBe(0);
  });

  it('3. Hospital A cannot modify Hospital B data (cross-tenant update)', async () => {
    await withRole(HOSP_A, USER_A, async (tx) => {
      const res = await tx.visit.updateMany({
        where: { hospitalId: HOSP_B },
        data: { amount: 9999 }
      });
      expect(res.count).toBe(0);
    });
    const visitB1 = await prismaAdmin.visit.findUnique({ where: { id: 'visit-B1' } });
    expect(visitB1?.amount).toBe(500);
  });

  it('4. Cross-tenant delete is prevented', async () => {
    await withRole(HOSP_A, USER_A, async (tx) => {
      const res = await tx.visit.deleteMany({
        where: { hospitalId: HOSP_B }
      });
      expect(res.count).toBe(0);
    });
    const visitB1 = await prismaAdmin.visit.findUnique({ where: { id: 'visit-B1' } });
    expect(visitB1).not.toBeNull();
  });

  it('5. Attempting to insert a record for another hospital is rejected', async () => {
    await expect(
      withRole(HOSP_A, USER_A, async (tx) => {
        return tx.visit.create({
          data: {
            id: 'visit-malicious',
            hospitalId: HOSP_B,
            patientName: 'Hacker',
            patientPhone: '999',
            amount: 0,
          }
        });
      })
    ).rejects.toThrow();
  });
});
