import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { Logger, Module } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/v1/direct-messages.repository';
import { EmotionsRepository } from '@repositories/v1/emotions.repository';
import { UsersRepository } from '@repositories/v1/users.repository';
import { DirectMessagesModule } from '@v1/direct-messages/direct-messages.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    DirectMessagesModule,
    CustomTypeOrmModule.forCustomRepository([UsersRepository, DirectMessagesRepository, EmotionsRepository]),
  ],
  controllers: [UsersController],
  providers: [Logger, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
