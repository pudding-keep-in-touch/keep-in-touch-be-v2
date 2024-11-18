import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { Module } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/v1/direct-messages.repository';
import { EmotionsRepository } from '@repositories/v1/emotions.repository';
import { UsersRepository } from '@repositories/v1/users.repository';
import { DirectMessagesController } from './direct-messages.controller';
import { DirectMessagesService } from './direct-messages.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([DirectMessagesRepository, UsersRepository, EmotionsRepository])],
  controllers: [DirectMessagesController],
  providers: [DirectMessagesService],
  exports: [DirectMessagesService],
})
export class DirectMessagesModule {}
