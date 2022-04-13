import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PlaceService } from './place.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  @Inject(PlaceService)
  private readonly placeService: PlaceService;

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('send_message')
  handleMessage(client: Socket, payload: string): void {
    this.server.emit('receive_message', payload);
  }

  @SubscribeMessage('send_pixel')
  handlePixelBinary(client: Socket, b: Buffer): void {
    this.server.emit('receive_pixel', b);
    this.placeService.manipulateCanvas(b);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.server.allSockets().then((data) => {
      this.server.emit('active_users', data.size);
    });
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.server.allSockets().then((data) => {
      this.server.emit('active_users', data.size);
    });
    this.logger.log(`Client connected: ${client.id}`);
  }
}
