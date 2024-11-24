import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Question } from '@entities/question.entity';

type CreateQuestionParams = {
  userId: string;
  content: string;
  isHidden: boolean;
};

@CustomEntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  /**
   * 질문을 생성하고 생성된 질문의 id를 반환합니다.
   * @param params 질문 생성에 필요한 정보, userId, content, isHidden
   * @returns
   */
  async createQuestion(params: CreateQuestionParams): Promise<string> {
    const { content, isHidden, userId } = params;
    const result = await this.insert({ content, isHidden, userId });
    return result.identifiers[0].questionId;
  }

  async countQuestionsByUserId(userId: string): Promise<number> {
    return this.count({ where: { userId } });
  }
}
