import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { User } from '@entities/user.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(User)
export class UsersRepository extends Repository<User> {
  // 유저 이메일 기준으로 조회
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  /**
   * 회원 생성
   *
   * @param email
   * @param nickname
   * @param loginType
   * @returns 생성한 user의 userId
   */
  async createUser(email: string, nickname: string, loginType: number): Promise<number> {
    const result = await this.insert({ email, nickname, loginType });
    return result.identifiers[0].id;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.findOne({ where: { userId: id } });
  }
}
