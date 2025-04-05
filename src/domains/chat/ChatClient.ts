import { WebSocket } from 'ws';

export default class ChatClient {
  private readonly _memberId: number;
  private readonly _ws: WebSocket;
  constructor(ws: WebSocket, memberId: number) {
    this._ws = ws;
    this._memberId = memberId;
  }
  handleMessage() {
  }
  send(payload: object) {
    try {
      const dataString = JSON.stringify(payload);
      this.ws.send(dataString);
    } catch (error) {
      console.error(error);
    }
  }
  close(statusCode?: number, reason?: string) {
    if (! this.isClosed) {
      this.ws.close(statusCode, reason);
    }
  }
  get isClosed() {
    return this.ws.readyState === WebSocket.CLOSED;
  }
  get ws() {
    return this._ws;
  }
  get memberId() {
    return this._memberId;
  }
}
