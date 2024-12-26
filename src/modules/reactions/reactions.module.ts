import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { Module } from '@nestjs/common';
import { MessageRepository } from '@repositories/message.repository';
import { ReactionTemplateRepository } from '@repositories/reaction-template.repository';
import { ReactionRepository } from '@repositories/reaction.repository';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([ReactionRepository, ReactionTemplateRepository, MessageRepository]),
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule {}
