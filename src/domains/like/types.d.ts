import { AuthenticatedRequest } from '@/domains/auth/types';
import { z } from 'zod';
import { LikePostRequestQuerySchema } from '@/domains/like/schema';

export type LikePostRequest = AuthenticatedRequest<{}, {}, z.infer<typeof LikePostRequestQuerySchema>>;
