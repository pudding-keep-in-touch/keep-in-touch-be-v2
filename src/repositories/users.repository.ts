import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '@entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly repository: Repository<Users>,
  ) {}

  // 유저 이메일 기준으로 조회
  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.repository.findOne({ where: { email } });
  }

  // 회원 등록
  async createUser(email: string, password: string, loginType: number): Promise<Users> {
    return await this.repository.save({ email, password, loginType });
  }
}
