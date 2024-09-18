import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { DirectMessageGateway } from '@gateways/direct-message.gateway';
import { Module } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { UsersRepository } from '@repositories/users.repository';
import { DirectMessagesController } from './direct-messages.controller';
import { DirectMessagesService } from './direct-messages.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([DirectMessagesRepository, UsersRepository, EmotionsRepository])],
  controllers: [DirectMessagesController],
  providers: [DirectMessagesService, DirectMessageGateway],
  exports: [DirectMessagesService], 
})
export class DirectMessagesModule {}
