import { Module } from '@nestjs/common';

import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { LoggerModule } from '@logger/logger.module';
import { UserRepository } from '@repositories/user.repository';

import { MessageStatisticRepository } from '@repositories/message-statistic.repository';
import { MessageRepository } from '@repositories/message.repository';
import { QuestionRepository } from '@repositories/question.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([
      UserRepository,
      QuestionRepository,
      MessageRepository,
      MessageStatisticRepository,
    ]),
    LoggerModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
