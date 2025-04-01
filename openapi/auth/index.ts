import { currentApiPrefix } from '../../src/constants';
import {
  EmailCodeInputRequestBodySchema,
  EmailVerifyRequestBodySchema,
  EmailVerifyResponseBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  RegisterRequestBodySchema,
  RegisterResponseBodySchema,
} from '../../src/domains/auth/schema';

export const authApiPaths = {
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
        202: {
          description: '인증 코드 전송 성공',
          content: {
            'application/json': {
              schema: EmailVerifyResponseBodySchema,
            },
          },
        },
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
        202: {
          description: '인증 성공',
          content: {
            'application/json': {
              schema: EmailVerifyResponseBodySchema,
            },
          },
        },
        400: {
          description: '코드 오류 또는 만료',
        },
      },
    },
  },

  [`${currentApiPrefix}/register`]: {
    post: {
      summary: '회원가입',
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
        },
      },
    },
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
        },
      },
    },
  },
};
