import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, DirectMessagesModule],
  exports: [AuthModule, UsersModule, DirectMessagesModule],
})
export class V1Module {}
