import { Module } from '@nestjs/common';

import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';

import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './repository/question.repository';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([QuestionRepository])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
