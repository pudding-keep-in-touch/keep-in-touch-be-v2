import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { Logger, Module } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { UsersRepository } from '@repositories/users.repository';
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
