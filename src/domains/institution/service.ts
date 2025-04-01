import {
  GetInstitutionsRequest,
  GetInstitutionsResponse,
  GetInstitutionBoundsRequest,
  GetInstitutionBoundsResponse,
} from '@/domains/institution/types';
import prisma from '@/utils/database';

export async function getInstitutions(_: GetInstitutionsRequest, res: GetInstitutionsResponse) {
  const institutions = await prisma.institution.findMany();
  res.json({
    institutions,
  });
}

export async function getInstitutionBounds(_: GetInstitutionBoundsRequest, res: GetInstitutionBoundsResponse) {
  const bounds = await prisma.institutionBound.findMany();
  res.json({
    bounds,
  });
}
