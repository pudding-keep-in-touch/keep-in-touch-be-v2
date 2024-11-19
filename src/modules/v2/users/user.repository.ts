import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { User } from '@entities/v2/user.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(User)
export class UserRepository extends Repository<User> {
  // 유저 이메일 기준으로 조회
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  // 회원 등록
  async createUser(email: string, password: string, loginType: number): Promise<number> {
    const result = await this.insert({ email, password, loginType });
    return result.identifiers[0].id;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.findOne({ where: { userId: id } });
  }
}
