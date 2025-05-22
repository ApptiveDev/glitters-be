import {
  GetInstitutionsResponse,
  GetInstitutionBoundsResponse,
} from '@/domains/institution/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { StatusCodes } from 'http-status-codes';
import { InstitutionBound } from '@/schemas';

export async function getInstitutions(_: AuthenticatedRequest, res: GetInstitutionsResponse) {
  const institutions = await prisma.institution.findMany();
  res.status(StatusCodes.OK).json({
    institutions,
  });
}

export async function getInstitutionBounds(_: AuthenticatedRequest, res: GetInstitutionBoundsResponse) {
  const bounds: Record<number, InstitutionBound> = {};
  (await prisma.institutionBound.findMany()).forEach(bound => {
    bounds[bound.institutionId] = bound;
  });
  res.status(StatusCodes.OK).json({
    bounds,
  });
}
