import { AuthenticatedRequest } from '@/domains/auth/types';
import {
  ExpoTokenInputRequestBodySchema,
  LocationInputRequestBodySchema,
} from '@/domains/notification/schema';
import { z } from 'zod';

export type LocationInputRequest = AuthenticatedRequest<{}, z.infer<typeof LocationInputRequestBodySchema>>;
export type ExpoTokenInputRequest = AuthenticatedRequest<{}, z.infer<typeof ExpoTokenInputRequestBodySchema>>;

export interface NotificationData extends Record<string, unknown> {
  type: 'chat' | 'nearby' | 'likes' | 'views';
}
