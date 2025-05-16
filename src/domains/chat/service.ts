import {
  CreateChatroomRequest,
  CreateChatroomResponse, DeactivateChatroomRequest,
  GetChatroomsResponse,
  GetChatsRequest,
  GetChatsResponse,
  OutboundChat,
  PublishableChat,
} from '@/domains/chat/types';
import {
  CreateChatroomRequestBodySchema, DeactivateChatroomRequestPathSchema,
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
import { Response } from 'express';
import { isBlocked } from '@/domains/block/service';
import { z } from 'zod';


export async function getChats(req: GetChatsRequest, res: GetChatsResponse) {
  const { id: chatroomId } = GetChatsRequestPathSchema.parse(req.params);
  const { cursor, limit } = GetChatsRequestQuerySchema.parse(req.query);
  const member = req.member!;

  if(! await getJoinedChatroomWithId(member, chatroomId)) {
    throw new ForbiddenError('참여한 채팅방이 아닙니다.');
  }

  const chatData = await prisma.chat.findMany({
    where: { chatroomId },
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

  await prisma.chat.updateMany({
    where: {
      chatroomId,
      receiverId: member.id,
    },
    data: {
      isRead: true,
    }
  });
  res.status(StatusCodes.OK).json({
    chats,
    lastChatId: chats[chats.length-1].id,
  });
}

export async function getChatrooms(req: AuthenticatedRequest, res: GetChatroomsResponse) {
  const member = req.member!;
  const chatrooms = await prisma.chatRoom.findMany({
    where: {
      isDeactivated: false,
      OR: [{ authorId: member.id }, { requesterId: member.id }],
    },
    select: {
      authorId: true,
      requesterId: true,
      authorNickname: true,
      requesterNickname: true,
      id: true,
      isDeactivated: true,
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
      },
      _count: {
        select: {
          chats: {
            where: {
              isRead: false,
              receiverId: member.id,
            },
          },
        },
      },
    },
  });
  const chatroomInfo
    = chatrooms.map(chatroom => ({
    id: chatroom.id,
    peerNickname: chatroom.authorId === member.id ? chatroom.requesterNickname : chatroom.authorNickname,
    myNickname: chatroom.authorId === member.id ? chatroom.authorNickname : chatroom.requesterNickname,
    post: chatroom.post,
    lastMessage: chatroom.chats[0],
    unreadMessageCount: chatroom._count.chats,
  }));
  res.status(StatusCodes.OK).json({
    chatrooms: chatroomInfo,
  });
}

export async function deactivateChatroom(req: DeactivateChatroomRequest, res: Response) {
  const { id: chatroomId } = DeactivateChatroomRequestPathSchema.parse(req.params);
  const member = req.member!;
  const chatroom = await getJoinedChatroomWithId(member, chatroomId);
  if(! chatroom) {
    throw new ForbiddenError('본인이 입장한 채팅방이 아닙니다.');
  }
  await prisma.chatRoom.update({
    where: {
      id: chatroomId,
    },
    data: {
      isDeactivated: true,
    }
  });
  res.status(StatusCodes.OK).send();
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
    throw new BadRequestError('이미 채팅방이 개설되어 있습니다.');
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
