import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class DirectMessageGateway {
  @WebSocketServer()
  server: Server;

  sendNotificationToUser(userId: number, message: string) {
    this.server.to(`user-${userId}`).emit('newNotification', message);
  }
}
