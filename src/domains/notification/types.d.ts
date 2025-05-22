import { AuthenticatedRequest } from '@/domains/auth/types';
import {
  ExpoTokenInputRequestBodySchema,
  LocationInputRequestBodySchema,
} from '@/domains/notification/schema';
import { z } from 'zod';
import { NearbyMarkerInfo } from '@/domains/marker/types';

export type LocationInputRequest = AuthenticatedRequest<{}, z.infer<typeof LocationInputRequestBodySchema>>;
export type ExpoTokenInputRequest = AuthenticatedRequest<{}, z.infer<typeof ExpoTokenInputRequestBodySchema>>;

export interface NotificationData extends Record<string, unknown> {
  type: 'chat' | 'posts' | 'likes' | 'views' | 'nearby';
}

export interface NearbyNotificationData extends NotificationData, NearbyMarkerInfo {
  type: 'nearby',
}

export interface PostNotificationData extends NotificationData {
  type: 'likes' | 'views',
  postId: number,
  count: number,
}

export interface PostCreationNotificationData extends NotificationData {
  type: 'posts';
}

