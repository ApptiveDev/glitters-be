import { currentApiPrefix } from '../../../src/constants';
import {
  EmailCodeInputRequestBodySchema,
  EmailVerifyRequestBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  PasswordChangeRequestBodySchema,
  RegisterRequestBodySchema,
  RegisterResponseBodySchema,
} from '../../../src/domains/auth/schema';
import { ErrorSchema } from '../../../src/domains/error/schema';
import { tokenHeader } from '../headers';

export const authApiPaths = {
  [`${currentApiPrefix}/password`]: {
    put: {
      summary: '패스워드 변경 요청 (이메일 인증 선행 필요)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: PasswordChangeRequestBodySchema,
          },
        },
      },
      responses: {
        200: {
          description: '패스워드 변경 성공',
        }
      }
    }
  },
  [`${currentApiPrefix}/verify-email`]: {
    post: {
      summary: '이메일 인증 코드 요청',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: EmailVerifyRequestBodySchema,
          },
        },
      },
      responses: {
        201: {
          description: '인증 코드 전송 성공',
        },
        400: {
          description: '등록되지 않은 이메일 도메인',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
        403: {
          description: '가입이 제한된 이메일',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          }
        }
      },
    },
    put: {
      summary: '이메일 인증 코드 확인',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: EmailCodeInputRequestBodySchema,
          },
        },
      },
      responses: {
        201: {
          description: '인증 성공',
        },
        400: {
          description: '코드 오류 또는 만료',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },

  [`${currentApiPrefix}/register`]: {
    post: {
      summary: '회원가입 (이메일 인증 선행 필요)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: RegisterRequestBodySchema,
          },
        },
      },
      responses: {
        200: {
          description: '회원가입 성공',
          content: {
            'application/json': {
              schema: RegisterResponseBodySchema,
            },
          },
        },
        400: {
          description: '이메일 미인증 또는 중복',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },
  [`${currentApiPrefix}/logout`]: {
    post: {
      summary: '로그아웃',
      security: [{bearerAuth: []}],
      parameters: [
        tokenHeader,
      ],
      responses: {
        200: {
          description: '로그아웃 완료',
        }
      }
    }
  },

  [`${currentApiPrefix}/login`]: {
    post: {
      summary: '로그인',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LoginRequestBodySchema,
          },
        },
      },
      responses: {
        200: {
          description: '로그인 성공',
          content: {
            'application/json': {
              schema: LoginResponseBodySchema,
            },
          },
        },
        400: {
          description: '이메일 또는 비밀번호 오류',
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
