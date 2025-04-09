import { currentApiPrefix } from '../../../src/constants';
import { CreateReportRequestBodySchema } from '../../../src/domains/report/schema';
import { ErrorSchema } from '../../../src/domains/error/schema';
import { tokenHeader } from '../headers';

export const reportApiPaths = {
  [`${currentApiPrefix}/reports`]: {
    post: {
      summary: '신고 등록',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: CreateReportRequestBodySchema,
          },
        },
      },
      responses: {
        201: {
          description: '신고 등록 성공',
        },
        400: {
          description: '잘못된 요청 또는 자기 자신 신고 시도',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
        404: {
          description: '대상 사용자를 찾을 수 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },
};
