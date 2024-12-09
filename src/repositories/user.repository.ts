import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { MessageStatistic } from '@entities/message-statistic.entity';
import { User } from '@entities/user.entity';

@CustomEntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * 회원 생성
   *
   * @param email
   * @param nickname
   * @param loginType
   * @returns 생성한 user의 userId
   */
  async createUser(email: string, nickname: string, loginType: number): Promise<string> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      // 1. User 생성
      const userResult = await transactionalEntityManager.insert(User, {
        email,
        nickname,
        loginType,
      });

      const userId = userResult.identifiers[0].userId;

      // 2. MessageStatistics 생성 (user와 1:1 관계)
      await transactionalEntityManager.insert(MessageStatistic, {
        userId: userId,
      });

      return userId;
    });
  }

  // 유저 이메일 기준으로 조회
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne({ where: { userId: id } });
  }
}
