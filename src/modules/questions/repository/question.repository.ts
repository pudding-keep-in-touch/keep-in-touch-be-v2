import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Question } from '@entities/question.entity';

@CustomEntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  /**
   * 질문을 생성하고 생성된 질문의 id를 반환합니다.
   *
   * @param content
   * @param userId
   * @returns
   */
  async createQuestion(content: string, isHidden: boolean, userId: number): Promise<number> {
    const result = await this.insert({ content, isHidden, userId });
    return result.identifiers[0].questionId;
  }

  async countQuestionsByUserId(userId: number): Promise<number> {
    return this.count({ where: { userId } });
  }
}
