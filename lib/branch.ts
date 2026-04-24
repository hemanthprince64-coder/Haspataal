import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getActiveBranchId() {
  const cookieStore = await cookies();
  return cookieStore.get('active_branch_id')?.value || null;
}

export async function getActiveBranch(hospitalId: string) {
  const branchId = await getActiveBranchId();
  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, hospitalId, isActive: true }
    });
    if (branch) return branch;
  }

  // Fallback to main branch
  return await prisma.branch.findFirst({
    where: { hospitalId, isMainBranch: true, isActive: true }
  });
}
