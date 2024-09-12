import { Injectable } from '@nestjs/common';
import { RequestGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { UsersRepository } from '@repositories/users.repository';
import { Users } from '@entities/users.entity';
import { LoginType, UserStatus } from './user.enum';

@Injectable()
export class UsersService {
  // constructor(private readonly directMessagesService: DirectMessagesService) {}

  constructor(private readonly usersRepository: UsersRepository) {}

  // 추후 directMessages service 에서 함수 가져와야 함
  async getDmListByUserId(userId: number, request: RequestGetDmListByUserIdDto) {
    const mockDms: any = [
      {
        id: 1,
        senderId: 10,
        receiverId: userId,
        content: '안녕, 너가 토이 프로젝트를 배포까지 하다니 진짜 대단하다..!!',
        emotion: {
          name: '응원과 감사',
          emoji: '🌟',
        },
        isRead: false,
        isDeleted: false,
        createdAt: '2024-09-02',
        comments: {
          emoji: '😁',
          content: '덕분에 자신감이 생겼어. 고마워',
          createdAt: '2024-09-02',
        },
      },
      {
        id: 2,
        senderId: 13,
        receiverId: userId,
        content: '토이 프로젝트 끝까지 함께해줘서 정말 고맙습니다.',
        emotion: {
          name: '응원과 감사',
          emoji: '🌟',
        },
        isRead: false,
        isDeleted: false,
        createdAt: '2024-09-02',
        comments: {
          emoji: '🥰',
          content: '함께해서 정말 재밌었습니다. 감사합니다.',
          createdAt: '2024-09-02',
        },
      },
    ];

    if (request.type === 'received') {
      return mockDms;
    }
  }

  // 구글 로그인 유저 생성 또는 업데이트
  async createOrUpdateGoogleUser(googleUser: any): Promise<Users> {
    let user = await this.getUserByEmail(googleUser.email);

    if (!user) {
      // 새 사용자 생성
      user = this.usersRepository.create({
        email: googleUser.email,
        nickname: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
        loginType: LoginType.GOOGLE, // 구글 로그인 타입
        status: UserStatus.NORMAL, // 정상 상태로 변경
      });
    } else {
      // 기존 사용자 정보 업데이트
      user.nickname = `${googleUser.firstName} ${googleUser.lastName}`.trim();
      user.loginType = LoginType.GOOGLE; // 구글 로그인으로 업데이트
    }

    return await this.usersRepository.save(user);
  }

  // 유저 이메일 조회
  async getUserByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.getUserByEmail(email);
  }

  // 유저 id 조회
  async getUserById(id: number): Promise<Users> {
    return await this.usersRepository.getUserById(id);
  }
}
