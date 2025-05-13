import http, { IncomingMessage } from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';
import { isInvalidatedToken, verifyToken } from '@/domains/auth/utils';
import ChatClient from '@/domains/chat/ChatClient';
import { pub, sub } from '@/utils/redis';
import { PublishableChatSchema } from '@/domains/chat/schema';
import prisma from '@/utils/database';
import { sendPushToMember } from '@/domains/notification/utils';
import { PublishableChat } from '@/domains/chat/types';

export const REDIS_CHANNEL_PREFIX = 'chatroom:';
export default class ChatServer {

  private readonly wss: WebSocketServer;
  private static instance: ChatServer;
  private clients: Map<number, ChatClient> = new Map();

  constructor(http: http.Server) {
    this.wss = new WebSocketServer({ server: http });
    ChatServer.instance = this;
    this.bindConnectionHandler();
    this.bindPubSubHandler();
  }
  async handleSocketConnection(ws: WebSocket, req: IncomingMessage) {
    try {
      const url = req.url!;
      const token = url.split('?token=')[1];
      const { id: memberId } = verifyToken(token);
      if(await isInvalidatedToken(token)) {
        this.sendErrorAndClose(ws, '사용자 인증 정보가 유효하지 않습니다.');
        return;
      }
      // client 등록
      const client = new ChatClient(this, ws, memberId);
      this.registerClient(client);
    } catch(e) {
      this.sendErrorAndClose(ws, '서버 연결 중 에러가 발생했습니다.');
      console.error(e);
    }
  }
  // send chat to another client or publish push message
  // handle redis publish/subscribed message
  sendErrorAndClose(ws: WebSocket, message: string) {
    if (ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'error',
        message,
      });
      ws.send(payload);
    }
    ws.close(4000, message);
  }

  async createChat(payload: PublishableChat, receiverId: number) {
    // 온/오프라인 체크 후 메시지 전송 방식 결정, 추후 db 쿼리와 전송 로직 분리
    const {
      content,
      createdAt,
      chatroomId,
      senderId,
      senderNickname,
    } = PublishableChatSchema.parse(payload);
    let isRead = false;
    if(this.clients.has(receiverId)) {
      isRead = true;
      this.clients.get(receiverId)!.sendChat({
        chatroomId,
        createdAt,
        content,
      });
    } else {
      await this.sendChatNotification(receiverId, senderNickname, content);
    }
    await prisma.chat.create({
      data: {
        chatroomId,
        content,
        senderId,
        receiverId,
        isRead, // 현재 전송 가능한 경우 true
        createdAt,
      }
    });
  }

  async handleMessagePublish(_: string, channel: string, message: string) {
    // 누군가 메시지 publish
    try {
      const receiverId = parseInt(channel.split(':')[2]);
      const payload = JSON.parse(message);
      await this.createChat(payload, receiverId);
    } catch(e) {
      console.error(e);
    }
  }

  async sendChatNotification(receiverId: number, senderNickname: string, content: string) {
    const receiver = await prisma.member.findUniqueOrThrow({
      where: { id: receiverId },
    });
    return sendPushToMember(receiver, senderNickname, content);
  };

  bindPubSubHandler() {
    sub.psubscribe(`${REDIS_CHANNEL_PREFIX}*`, (err) => {
      if(err) {
        console.error(err);
      }
    });
    pub.on('pmessage', this.handleMessagePublish.bind(this));
  }

  bindConnectionHandler() {
    this.wss.on('connection', this.handleSocketConnection.bind(this));
  }

  registerClient(client: ChatClient) {
    this.clients.set(client.memberId, client);
  }

  removeClient(client: ChatClient) { // 단순히 map에서 제거. ws close는 클라이언트에서 처리
    this.clients.delete(client.memberId);
  }

  static getInstance() {
    return ChatServer.instance;
  }
}
