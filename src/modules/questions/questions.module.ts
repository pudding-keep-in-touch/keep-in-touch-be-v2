import { Module } from '@nestjs/common';

import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';

import { QuestionRepository } from '@repositories/question.repository';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([QuestionRepository])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
