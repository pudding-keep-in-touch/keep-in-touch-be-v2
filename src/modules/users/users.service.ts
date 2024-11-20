import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { GoogleUser } from '@common/types/google-user.type';
import { User } from '@entities/user.entity';
import { UsersRepository } from '@modules/users/users.repository';

import { LoginType } from './users.constants';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  /**
   * 구글 사용자 로그인 혹은 회원가입
   *
   * @param googleUser
   * @returns
   */
  async createOrGetGoogleUser(googleUser: GoogleUser): Promise<{ userId: number; email: string }> {
    const user = await this.getUserByEmail(googleUser.email);

    if (user !== null) {
      if (user.loginType !== LoginType.GOOGLE) {
        throw new ConflictException('이미 다른 로그인 방식으로 가입된 이메일입니다.');
      }
      return { userId: user.userId, email: user.email };
    }

    const result = await this.userRepository.insert({
      email: googleUser.email,
      nickname: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
      loginType: LoginType.GOOGLE,
    });

    return { userId: result.identifiers[0].id, email: googleUser.email };
  }

  /**
   * id 기준으로 사용자 닉네임 조회
   *
   * @param userId
   * @returns
   */
  async getNicknameById(userId: number): Promise<string> {
    const user = await this.userRepository.getUserById(userId);
    if (user === null) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user.nickname;
  }

  /**
   * email 기준으로 사용자 조회
   *
   * @param email (unique)
   * @returns
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.getUserByEmail(email);
  }

  /**
   * id 기준으로 사용자 조회
   *
   * @param id
   * @returns
   */
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.getUserById(id);
  }
}
