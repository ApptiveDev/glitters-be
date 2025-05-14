import {
  CreateChatroomRequest,
  CreateChatroomResponse,
  GetChatroomsResponse,
  GetChatsRequest,
  GetChatsResponse,
  OutboundChat,
  PublishableChat,
} from '@/domains/chat/types';
import {
  CreateChatroomRequestBodySchema,
  GetChatsRequestPathSchema,
  GetChatsRequestQuerySchema, GetChatsResponseBodySchema,
} from '@/domains/chat/schema';
import prisma from '@/utils/database';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@/domains/error/HttpError';
import {
  createAuthorNickname,
  createRequesterNickname,
} from '@/domains/chat/utils';
import ChatServer from '@/domains/chat/ChatServer';
import { StatusCodes } from 'http-status-codes';
import { ChatRoom } from '@/schemas';
import { InternalMember, PublicMember } from '@/domains/member/types';
import { Prisma } from '.prisma/client';
import { AuthenticatedRequest } from '@/domains/auth/types';
  import { isBlocked } from '@/domains/block/service';
import { z } from 'zod';


export async function getChats(req: GetChatsRequest, res: GetChatsResponse) {
  const { id } = GetChatsRequestPathSchema.parse(req.params);
  const { cursor, limit } = GetChatsRequestQuerySchema.parse(req.query);
  const member = req.member!;

  if(! await getJoinedChatroomWithId(member, id)) {
    throw new ForbiddenError('참여한 채팅방이 아닙니다.');
  }

  const chatData = await prisma.chat.findMany({
    where: { chatroomId: id },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { id: 'desc' },
  });
  const chats: z.infer<typeof GetChatsResponseBodySchema>['chats'] = chatData.map(chat => ({
    type: chat.senderId === member.id ? 'sentChat' : 'receivedChat',
    id: chat.id,
    content: chat.content,
    createdAt: chat.createdAt,
  }));
  res.status(StatusCodes.OK).json({
    chats
  });
}

export async function getChatrooms(req: AuthenticatedRequest, res: GetChatroomsResponse) {
  const member = req.member!;
  const chatrooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ authorId: member.id }, { requesterId: member.id }],
    },
    select: {
      authorId: true,
      requesterId: true,
      authorNickname: true,
      requesterNickname: true,
      id: true,
      isDeactivated: false,
      post: {
        omit: {
          authorId: true,
        }
      },
      chats: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        omit: {
          senderId: true,
          chatroomId: true,
        }
      }
    },
  });
  const chatroomInfo = chatrooms.map(chatroom => ({
    id: chatroom.id,
    peerNickname: chatroom.authorId === member.id ? chatroom.requesterNickname : chatroom.authorNickname,
    post: chatroom.post,
    lastMessage: chatroom.chats[0],
  }));
  res.status(StatusCodes.OK).json({
    chatrooms: chatroomInfo,
  });
}

export async function createChatroom(req: CreateChatroomRequest, res: CreateChatroomResponse) {
  const member = req.member!;
  const { postId, content } = CreateChatroomRequestBodySchema.parse(req.body);
  const chatroom = await prisma.chatRoom.findFirst({
    where: {
      postId,
      requesterId: member.id,
    }
  });
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    }
  });

  if(! post) {
    throw new NotFoundError('존재하지 않는 게시글입니다.');
  }
  const { authorId } = post;
  if(await isBlocked(authorId, member.id)) { // 게시글 작성자가 차단된 경우
    throw new ForbiddenError('채팅방을 개설할 수 없습니다.');
  }
  if(chatroom) {
    const chat = createPublishableChat(chatroom, member, content);
    await ChatServer.getInstance().createChat(chat, post.authorId);
    const outboundChat = createOutboundChat(chat, chatroom);
    res.status(StatusCodes.OK).json({
      ...outboundChat,
      authorNickname: chatroom.authorNickname,
    });
    return;
  }

  if(post.authorId === member.id) {
    throw new BadRequestError('자기 자신과의 채팅방은 만들 수 없습니다.');
  }

  const createdChatroom = await prisma.chatRoom.create({
    data: {
      postId: post.id,
      authorId: post.authorId,
      requesterId: member.id,
      requesterNickname: createRequesterNickname(),
      authorNickname: createAuthorNickname(),
    }
  });
  const publishableChat = createPublishableChat(createdChatroom, member, content);
  const outboundChat = createOutboundChat(publishableChat, createdChatroom);
  await ChatServer.getInstance().createChat(publishableChat, post.authorId);
  res.status(StatusCodes.OK).json({
    ...outboundChat,
    authorNickname: createdChatroom.authorNickname,
  });
}

export async function findUnreadChats(member: PublicMember | number, chatroomId?: number) {
  if(typeof member === 'object') {
    member = member.id;
  }
  return (await prisma.chat.findMany({
    where: {
      receiverId: member,
      isRead: false,
      ...(chatroomId && { chatroomId }),
      ...(chatroomId && {
        chatroom: {
          isDeactivated: false,
        }
      }),
    },
    select: {
      chatroomId: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })).map((chat) => ({
    ...chat,
    type: 'receivedChat',
  } as OutboundChat));
}

export async function getJoinedChatroomWithId(member: PublicMember | number, chatroomId: number) {
  return getJoinedChatroom(member, {
    id: chatroomId,
  });
}

export async function getJoinedChatroom(member: PublicMember | number,
                                        where?: Prisma.ChatRoomWhereInput,
                                        select?: Prisma.ChatRoomSelect) {
  const id = typeof member === 'number' ? member : member.id;
  return prisma.chatRoom.findFirst({
    where: {
      OR: [{ requesterId: id }, { authorId: id }],
      ...where
    },
    select,
  });
}


export function createOutboundChat(chat: PublishableChat, chatroom: ChatRoom): OutboundChat {
  return {
    createdAt: chat.createdAt,
    type: 'receivedChat',
    content: chat.content,
    chatroomId: chatroom.id,
  };
}

export function createPublishableChat(
  chatroom: ChatRoom, member: InternalMember, content: string): PublishableChat {
  return {
    createdAt: new Date(),
    content,
    chatroomId: chatroom.id,
    senderId: member.id,
    senderNickname: chatroom.requesterNickname,
    type: 'publish'
  };
}
