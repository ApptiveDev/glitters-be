import { AuthenticatedRequest } from '@/domains/auth/types';
import { CreateReportRequestBodySchema } from '@/domains/report/schema';

export type CreateReportRequest = AuthenticatedRequest<z.infer<typeof CreateReportRequestBodySchema>>;
