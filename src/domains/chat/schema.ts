import { z } from 'zod';
import { ChatRoomSchema, ChatSchema, PostSchema } from '@/schemas';

export const MessageType = z.enum(['sentChat', 'receivedChat', 'read', 'error', 'publish', 'unreadChats']);

export const ErrorMessageSchema = z.object({
  type: z.literal(MessageType.enum.error),
  message: z.string(),
});

export const InboundChatSchema = z.object({
  type: z.literal(MessageType.enum.sentChat),
}).merge(
  ChatSchema.pick({
    chatroomId: true,
    content: true,
  })
).extend({
  content: z.string().max(255),
});

export const OutboundChatSchema = z.object({
  type: z.literal(MessageType.enum.receivedChat),
}).merge(
  ChatSchema.pick({
    chatroomId: true,
    content: true,
    createdAt: true,
  })
);

export const UnreadChatsSchema = z.object({
  type: z.literal(MessageType.enum.unreadChats),
  chats: z.array(OutboundChatSchema),
});

export const PublishableChatSchema = OutboundChatSchema.extend({
  type: z.literal(MessageType.enum.publish),
  senderId: z.number(),
  senderNickname: z.string(),
});

export const ReadChatroomMessageSchema = z.object({
  type: z.literal(MessageType.enum.read),
}).merge(
  ChatSchema.pick({
    chatroomId: true,
  })
);

export const SocketMessageSchema = z.union([
  InboundChatSchema,
  OutboundChatSchema,
  PublishableChatSchema,
  ReadChatroomMessageSchema,
  ErrorMessageSchema,
  UnreadChatsSchema,
]);

export const CreateChatroomRequestBodySchema = z.object({
  postId: PostSchema.shape.id,
  content: InboundChatSchema.shape.content,
});

export const CreateChatroomResponseSchema = OutboundChatSchema.merge(
  ChatRoomSchema.pick({
    authorNickname: true,
  })
);

export const GetChatsRequestPathSchema = z.object({
  id: z.preprocess(val => {
  if (typeof val === 'string' && /^\d+$/.test(val)) {
    return Number(val);
  }
  return val;
}, z.number().int().min(1)),
});

export const GetChatsRequestQuerySchema = z.object({
  cursor: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number().int().min(1).optional()),
  limit: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number().int().min(1).max(100).optional()),
});

export const GetChatsResponseBodySchema = z.object({
  chats: z.array(OutboundChatSchema.pick({
    content: true,
    createdAt: true,
  }).extend({
    type: z.enum([MessageType.enum.receivedChat, MessageType.enum.sentChat]),
  })),
});


export const GetChatroomsResponseBodySchema = z.object({
  chatrooms: z.array(ChatRoomSchema.pick({
    id: true,
  }).extend({
    peerNickname: z.string(),
    post: PostSchema.omit({
      authorId: true,
    }),
    lastMessage: ChatSchema.pick({
      createdAt: true,
      content: true,
    }),
  }))
});
