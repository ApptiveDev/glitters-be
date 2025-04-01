import {
  GetInstitutionsResponse,
  GetInstitutionBoundsResponse,
} from '@/domains/institution/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';

export async function getInstitutions(_: AuthenticatedRequest, res: GetInstitutionsResponse) {
  const institutions = await prisma.institution.findMany();
  res.json({
    institutions,
  });
}

export async function getInstitutionBounds(_: AuthenticatedRequest, res: GetInstitutionBoundsResponse) {
  const bounds = await prisma.institutionBound.findMany();
  res.json({
    bounds,
  });
}
