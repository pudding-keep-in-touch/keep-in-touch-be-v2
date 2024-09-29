import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class DirectMessageGateway {
  @WebSocketServer()
  server: Server;
  // socket: Socket;

  @SubscribeMessage('newDm')
  sendNotificationToUser(userId: number, message: string) {
    console.log('here');

    this.server.to(`user-${userId}`).emit('notification', message);
  }
}
