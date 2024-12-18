import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { ReactionInfo } from '@entities/reaction-info.entity';
import { ReactionsModule } from '@modules/reactions/reactions.module';
import { Module } from '@nestjs/common';
import { EmotionRepository } from '@repositories/emotion.repository';
import { MessageRepository } from '@repositories/message.repository';
import { QuestionRepository } from '@repositories/question.repository';
import { UserRepository } from '@repositories/user.repository';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([
      MessageRepository,
      UserRepository,
      QuestionRepository,
      EmotionRepository,
      ReactionInfo,
    ]),
    ReactionsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
