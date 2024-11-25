import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
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
    const result = await this.insert({ email, nickname, loginType });
    return result.identifiers[0].userId;
  }

  // 유저 이메일 기준으로 조회
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne({ where: { userId: id } });
  }
}
