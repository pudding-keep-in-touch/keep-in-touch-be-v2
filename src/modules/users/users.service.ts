import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { GoogleUser } from '@common/types/google-user.type';
import { User } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

import { ResponseGetUserNicknameDto } from './dto/get-user-nickname.dto';
import { LoginType } from './users.constants';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 구글 사용자 로그인 혹은 회원가입
   *
   * @param googleUser
   * @returns
   */
  async createOrGetGoogleUser(googleUser: GoogleUser): Promise<{ userId: string; email: string }> {
    const user = await this.getUserByEmail(googleUser.email);

    if (user !== null) {
      if (user.loginType !== LoginType.GOOGLE) {
        throw new ConflictException('이미 다른 로그인 방식으로 가입된 이메일입니다.');
      }
      return { userId: user.userId, email: user.email };
    }

    const userId = await this.userRepository.createUser(googleUser.email, googleUser.displayName, LoginType.GOOGLE);
    return { userId, email: googleUser.email };
  }

  /**
   * id 기준으로 사용자 닉네임 조회
   *
   * @param userId
   * @returns
   */
  async getNicknameById(userId: string): Promise<ResponseGetUserNicknameDto> {
    const user = await this.userRepository.findUserById(userId);
    if (user === null) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return { userId: user.userId, nickname: user.nickname };
  }

  /**
   * email 기준으로 사용자 조회
   *
   * @param email (unique)
   * @returns
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(email);
  }

  /**
   * id 기준으로 사용자 조회
   *
   * @param id
   * @returns
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }
}
