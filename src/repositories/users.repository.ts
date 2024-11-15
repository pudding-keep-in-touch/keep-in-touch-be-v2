import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Users } from '@entities/users.entity';
import { UserStatus } from '@v1/users/user.enum';
import { Repository } from 'typeorm';

@CustomEntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  // 유저 이메일 기준으로 조회
  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.findOne({ where: { email, status: UserStatus.NORMAL } });
  }

  // 회원 등록
  async createUser(email: string, password: string, loginType: number): Promise<Users> {
    return await this.save({ email, password, loginType });
  }

  // 유저 아이디 기준으로 조회
  async getUserById(id: number): Promise<Users | null> {
    return await this.findOne({ where: { id, status: UserStatus.NORMAL } });
  }
}
