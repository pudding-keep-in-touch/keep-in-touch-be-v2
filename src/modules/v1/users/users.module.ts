import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DirectMessagesModule } from '@v1/direct-messages/direct-messages.module';

@Module({
  imports: [DirectMessagesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
