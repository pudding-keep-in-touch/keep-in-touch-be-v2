import { Users } from '@entities/users.entity';
import { Repository } from 'typeorm';
import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';

@CustomEntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  // 유저 이메일 기준으로 조회
  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.findOne({ where: { email } });
  }

  // 회원 등록
  async createUser(email: string, password: string, loginType: number): Promise<Users> {
    return await this.save({ email, password, loginType });
  }
}
