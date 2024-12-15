import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { LoginType, User } from '@entities/user.entity';

type CreateUserParams = {
  email: string;
  nickname: string;
  loginType: LoginType;
};

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
  async createUser(createUserParams: CreateUserParams): Promise<string> {
    const result = await this.insert(createUserParams);
    return result.identifiers[0].userId;
  }

  async findUserByEmailWithLoginType(email: string, loginType: LoginType): Promise<User | null> {
    return await this.findOne({
      select: ['userId', 'nickname', 'email', 'loginType'],
      where: { email, loginType },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne({ where: { userId: id } });
  }
}
