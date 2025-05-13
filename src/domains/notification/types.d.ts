import { AuthenticatedRequest } from '@/domains/auth/types';
import {
  ExpoTokenInputRequestBodySchema,
  LocationInputRequestBodySchema,
} from '@/domains/notification/schema';
import { z } from 'zod';

export type LocationInputRequest = AuthenticatedRequest<{}, z.infer<typeof LocationInputRequestBodySchema>>;
export type ExpoTokenInputRequest = AuthenticatedRequest<{}, z.infer<typeof ExpoTokenInputRequestBodySchema>>;
