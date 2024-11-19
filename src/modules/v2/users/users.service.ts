import { ConflictException, Injectable } from '@nestjs/common';

import { User } from '@entities/v2/user.entity';
import { CustomLogger } from '@logger/custom-logger.service';
import { GoogleUser } from '@v2/auth/types/google-user.type';
import { UserRepository } from '@v2/users/user.repository';

import { LoginType } from './user.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: CustomLogger,
    private readonly userRepository: UserRepository,
  ) {}

  // 구글 로그인 유저 생성 또는 업데이트
  async createOrUpdateGoogleUser(googleUser: GoogleUser): Promise<{ userId: number; email: string }> {
    const user = await this.getUserByEmail(googleUser.email);

    console.debug('user: ', user);

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
