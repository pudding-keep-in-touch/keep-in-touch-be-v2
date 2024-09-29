import { Logger, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from '@repositories/users.repository';
import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { DirectMessagesModule } from '@v1/direct-messages/direct-messages.module';
import { EmotionsRepository } from '@repositories/emotions.repository';

@Module({
  imports: [
    DirectMessagesModule,
    CustomTypeOrmModule.forCustomRepository([UsersRepository, DirectMessagesRepository, EmotionsRepository])
  ],
  controllers: [UsersController],
  providers: [Logger, UsersService],
  exports: [UsersService],
})
export class UsersModule {}