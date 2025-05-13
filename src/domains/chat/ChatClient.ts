import WebSocket from 'ws';
import {
  InboundChat,
  OutboundChat, PublishableChat, ReadChatroomMessage,
  SocketMessage,
} from '@/domains/chat/types';
import {
  InboundChatSchema,
  ReadChatroomMessageSchema,
} from '@/domains/chat/schema';
import ChatServer, { REDIS_CHANNEL_PREFIX } from '@/domains/chat/ChatServer';
import prisma from '@/utils/database';
import { pub } from '@/utils/redis';
import {
  findUnreadChats,
  getJoinedChatroomWithId,
} from '@/domains/chat/service';

export default class ChatClient {
  private readonly ws: WebSocket;
  public isAlive = false;
  private readonly _memberId: number;
  private readonly server: ChatServer;
  private pingInterval: NodeJS.Timeout | null = null;
  constructor(server: ChatServer, ws: WebSocket, memberId: number) {
    this.server = server;
    this.ws = ws;
    this.isAlive = true;
    this._memberId = memberId;
    this.bindEventListeners();
    this.startPingChecker();
    this.sendUnreadChats();
  }

  async sendUnreadChats() {
    const chats = await findUnreadChats(this.memberId);
    this.send({ chats, type: 'unreadChats' });
  }

  async handleInboundChat(payload: InboundChat) {
    const { chatroomId, content } = InboundChatSchema.parse(payload);
    // 채팅을 보낸 사용자가 참여한 채팅방 조회.
    const chatroom = await getJoinedChatroomWithId(this.memberId, chatroomId);
    if(! chatroom) {
      this.sendError('참여 중인 채팅방이 아닙니다.');
      return;
    }
    // sender가 아닌 사용자가 receiver
    const receiverId = chatroom.requesterId === this.memberId ? chatroom.authorId : chatroom.requesterId;
    const senderNickname = chatroom.requesterId
    === this.memberId ? chatroom.authorNickname : chatroom.requesterNickname;
    const publishable: PublishableChat = {
      type: 'publish',
      createdAt: new Date(),
      senderId: this.memberId,
      senderNickname,
      chatroomId,
      content,
    };
    // redis publish
    pub.publish(`${REDIS_CHANNEL_PREFIX}${receiverId}`, JSON.stringify(publishable));
  }


  async handleChatroomRead(payload: ReadChatroomMessage) {
    const { chatroomId } = ReadChatroomMessageSchema.parse(payload);
    await prisma.chat.updateMany({
      where: {
        chatroomId,
        receiverId: this.memberId,
      },
      data: {
        isRead: true,
      }
    });
  }

  bindEventListeners() {
    this.ws.on('message', async(message) => {
      try {
        const payload = JSON.parse(message.toString()) as SocketMessage;
        switch(payload.type) {
          case 'sentChat':
            await this.handleInboundChat(payload);
            break;
          case 'read':
            await this.handleChatroomRead(payload);
            break;
        }
      } catch(e) {
        console.error(e);
        this.sendError('잘못된 메시지 형식입니다.');
      }
    });
    this.ws.on('pong', () => {
      this.isAlive = true;
    });
    this.ws.on('close', this.close.bind(this));
  }

  sendChat(payload: Omit<OutboundChat, 'type'>) {
    return this.send({
      type: 'receivedChat',
      ...payload,
    });
  }

  sendError(message: string) {
    this.send({
      type: 'error',
      message,
    });
  }

  send(payload: SocketMessage) {
    if (!this.isAlive || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`메시지 전송 실패: 소켓 연결 종료 상태 (memberId=${this.memberId})`);
      return;
    }
    return this.ws.send(JSON.stringify(payload));
  }

  startPingChecker() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState !== WebSocket.OPEN) return;

      if (!this.isAlive) {
        console.log(`ping timeout: closing member ${this.memberId}`);
        this.close();
        return;
      }

      this.isAlive = false;
      try {
        this.ws.ping();
      } catch (e) {
        console.error(`ping error: member ${this.memberId}`, e);
        this.close();
      }
    }, 30000);
  }

  get memberId() {
    return this._memberId;
  }

  close() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if(this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.isAlive = false;
    this.server.removeClient(this);
  }
}
