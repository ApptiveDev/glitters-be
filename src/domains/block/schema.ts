import { z } from 'zod';
import { ChatRoomSchema, PostSchema } from '@/schemas';

export const BlockType = z.enum(['post', 'chatroom']);

export const BlockRequestQuerySchema = z.object({
  blockType: BlockType,
  postId: PostSchema.shape.id.optional(),
  chatroomId: ChatRoomSchema.shape.id.optional(),
});
