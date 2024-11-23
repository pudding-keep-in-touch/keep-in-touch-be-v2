import { ConflictException, Injectable } from '@nestjs/common';
import { QUESTION_COUNT_LIMIT } from './constants/question.constant';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async createQuestion(createQuestionDto: CreateQuestionDto, userId: number) {
    const { content, isHidden } = createQuestionDto;

    const questionCount = await this.questionRepository.countQuestionsByUserId(userId);
    if (questionCount >= QUESTION_COUNT_LIMIT) {
      throw new ConflictException('질문은 10개까지만 생성할 수 있습니다.');
    }

    const questionId = await this.questionRepository.createQuestion(content, isHidden, userId);
    return { questionId };
  }
}
