import {
  GetInstitutionsResponse,
  GetInstitutionBoundsResponse,
} from '@/domains/institution/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { StatusCodes } from 'http-status-codes';

export async function getInstitutions(_: AuthenticatedRequest, res: GetInstitutionsResponse) {
  const institutions = await prisma.institution.findMany();
  res.status(StatusCodes.OK).json({
    institutions,
  });
}

export async function getInstitutionBounds(_: AuthenticatedRequest, res: GetInstitutionBoundsResponse) {
  const bounds = await prisma.institutionBound.findMany();
  res.status(StatusCodes.OK).json({
    bounds,
  });
}
