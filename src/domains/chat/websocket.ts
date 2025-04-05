import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'node:http';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '@/domains/auth/utils';
import ChatClient from '@/domains/chat/ChatClient';

export default class ChatServer {
  private readonly _wss;
  static activeClients: Map<number, ChatClient>;
  constructor(httpServer: http.Server) {
    this._wss = new WebSocketServer({ server: httpServer });
    ChatServer.activeClients = new Map();
  }

  bindWebsocketConnection() {
    this.wss.on('connection', (ws: WebSocket) => {
      const token = ws.url.split('?token=')[1];
      if (!token) {
        ws.close(StatusCodes.UNAUTHORIZED);
        return;
      }
      const { id: memberId } = verifyToken(token);
      const client = new ChatClient(ws, memberId);
      ChatServer.activeClients.set(memberId, client);

      ws.on('message', client.handleMessage.bind(client));
    });
  }

  get wss() {
    return this._wss;
  }
}
