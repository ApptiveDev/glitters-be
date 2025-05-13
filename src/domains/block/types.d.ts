import { AuthenticatedRequest } from '@/domains/auth/types';
import { BlockRequestQuerySchema } from '@/domains/block/schema';
import { z } from 'zod';

export type BlockRequest = AuthenticatedRequest<{}, {}, z.infer<typeof BlockRequestQuerySchema>>;
