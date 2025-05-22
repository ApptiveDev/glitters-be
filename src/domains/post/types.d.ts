import { AuthenticatedRequest } from '@/domains/auth/types';
import { z } from 'zod';
import { Response } from 'express';
import {
  CreatePostRequestBodySchema,
  CreatePostResponseBodySchema,
  DeletePostPathSchema,
  GetCreationAvailabilityResponseBodySchema,
  GetPostPathSchema,
  GetPostResponseSchema,
} from '@/domains/post/schema';

export type GetPostRequest = AuthenticatedRequest<z.infer<typeof GetPostPathSchema>>;
export type GetPostResponse = Response<z.infer<typeof GetPostResponseSchema>>;

export type DeletePostRequest = AuthenticatedRequest<z.infer<typeof DeletePostPathSchema>>;

export type CreatePostRequest = AuthenticatedRequest<{}, z.infer<typeof CreatePostRequestBodySchema>>;
export type CreatePostResponse = Response<z.infer<typeof CreatePostResponseBodySchema>>;

export type GetCreationAvailabilityResponse = Response<z.infer<typeof GetCreationAvailabilityResponseBodySchema>>;
