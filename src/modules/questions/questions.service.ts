import { Question } from '@entities/question.entity';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '@repositories/question.repository';
import { QUESTION_COUNT_LIMIT } from './constants/question.constant';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionHiddenParam } from './types/question.types';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async createQuestion(createQuestionDto: CreateQuestionDto, userId: string) {
    const { content, isHidden } = createQuestionDto;

    const questionCount = await this.questionRepository.countQuestionsByUserId(userId);
    if (questionCount >= QUESTION_COUNT_LIMIT) {
      throw new ConflictException(`질문은 ${QUESTION_COUNT_LIMIT}개까지만 생성할 수 있습니다.`);
    }

    const questionId = await this.questionRepository.createQuestion({
      userId: userId,
      content: content,
      isHidden: isHidden,
    });
    return { questionId };
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.questionRepository.findQuestionById(id);
  }

  async updateQuestionHidden(param: UpdateQuestionHiddenParam) {
    const { questionId, isHidden, userId } = param;
    const question = await this.questionRepository.findQuestionById(questionId);
    if (question === null) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('질문의 소유자가 아닙니다.');
    }

    await this.questionRepository.updateQuestionHidden(questionId, isHidden);
    return { questionId, isHidden };
  }
}
