import { AuthenticatedRequest } from '@/domains/auth/types';
import { CreateReportRequestBodySchema } from '@/domains/report/schema';
import { Report } from '@/schemas';

export type CreateReportRequest = AuthenticatedRequest<{}, z.infer<typeof CreateReportRequestBodySchema>>;

export interface ReportLog {
  reportType: Report['reportType'];
  reason: Report['reason'];
  id: number;
  createdAt: Date;
  data: any;
  issuerId: number;
  issuerEmail?: string;
  targetId: number;
  targetEmail: string;
}
