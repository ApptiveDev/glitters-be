import { ReportSchema } from '@/schemas';

export const CreateReportRequestBodySchema = ReportSchema.omit({
  id: true,
  createdAt: true,
  reportedId: true,
  reporterId: true,
}).partial({
  chatroomId: true,
  postId: true,
});
