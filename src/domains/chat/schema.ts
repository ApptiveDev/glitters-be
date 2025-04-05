import { z } from 'zod';

export const MessageType = z.enum(['CHAT_SEND', 'CHAT_READ']);
export const SocketMessageSchema = z.object({
  type: MessageType,
});

export const SendMessageSchema = SocketMessageSchema.extend({
  message: z.string().max(255),
  targetRoomId: z.number().int(),
});

export const ReadMessageSchema = SocketMessageSchema.extend({
  targetMessageId: z.number().int(),
  targetRoomId: z.number().int(),
});
