import { Injectable } from '@nestjs/common';
import { RequestGetDmListByUserIdDto, ResponseGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { UsersRepository } from '@repositories/users.repository';
import { Users } from '@entities/users.entity';
import { DirectMessagesService } from '@v1/direct-messages/direct-messages.service';
import { LoginType, UserStatus } from './user.enum';
import { ResponseGetUserHomeDto } from './dtos/get-user-home.dto';
import { getFormatDate } from '@common/helpers/date.helper';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly directMessagesService: DirectMessagesService) {}

  // 유저 홈 화면 조회
  async getUserHome(userId: number, isOwner: boolean): Promise<ResponseGetUserHomeDto> {
    if (isOwner) {
      const dmList = await this.directMessagesService.getDmListByUserId(userId, { limit: 3 });
      return {
        isOwner,
        dmList: dmList.map((dm) => {
          return {
            id: dm.id,
            senderId: dm.sender.id,
            receiverId: dm.receiver.id,
            content: dm.content,
            emotion: {
              name: dm.emotion.name,
              emoji: dm.emotion.emoji,
            },
            comment: {},
            isRead: dm.isRead,
            createdAt: getFormatDate(dm.createdAt), //FIXME 시간 포맷 변경 필요
          };
        })
      }
    } else {
      const friend = await this.usersRepository.getUserById(userId);
      return {
        isOwner,
        friendUser: {
          id: friend.id,
          nickname: friend.nickname,
        }
      }
    }
  }

  // 유저 id 기준 받은/보낸 쪽지 리스트 조회
  async getDmListByUserId(userId: number, request: RequestGetDmListByUserIdDto): Promise<ResponseGetDmListByUserIdDto[] | null> {
    const dmList = await this.directMessagesService.getDmListByUserId(userId, request);
    const parserData = dmList.map((dm) => {
      return {
        id: dm.id,
        senderId: dm.sender.id,
        receiverId: dm.receiver.id,
        content: dm.content,
        emotion: {
          name: dm.emotion.name,
          emoji: dm.emotion.emoji,
        },
        comment: {},
        isRead: dm.isRead,
        createdAt: getFormatDate(dm.createdAt), //FIXME 시간 포맷 변경 필요
      };
    });

    return parserData;
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
