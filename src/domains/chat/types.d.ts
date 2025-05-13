import { z } from 'zod';
import {
  InboundChatSchema,
  ReadChatroomMessageSchema,
  SocketMessageSchema,
  OutboundChatSchema,
  ErrorMessageSchema,
  PublishableChatSchema,
  UnreadChatsSchema,
  CreateChatroomRequestBodySchema,
  CreateChatroomResponseSchema,
  GetChatroomsResponseBodySchema,
} from '@/domains/chat/schema';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { Response } from 'express';

export type SocketMessage = z.infer<typeof SocketMessageSchema>;
export type InboundChat = z.infer<typeof InboundChatSchema>;
export type OutboundChat = z.infer<typeof OutboundChatSchema>;
export type PublishableChat = z.infer<typeof PublishableChatSchema>;
export type ReadChatroomMessage = z.infer<typeof ReadChatroomMessageSchema>;


export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

export type CreateChatroomRequest = AuthenticatedRequest<{}, z.infer<typeof CreateChatroomRequestBodySchema>>;
export type CreateChatroomResponse = Response<z.infer<typeof CreateChatroomResponseSchema>>;
export type GetChatroomsResponse = Response<z.infer<typeof GetChatroomsResponseBodySchema>>;

export type UnreadChats = z.infer<typeof UnreadChatsSchema>;
