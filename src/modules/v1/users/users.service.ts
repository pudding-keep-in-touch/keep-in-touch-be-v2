import { ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, LoggerService, NotFoundException } from '@nestjs/common';
import { RequestGetDmListByUserIdDto, ResponseGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { UsersRepository } from '@repositories/users.repository';
import { Users } from '@entities/users.entity';
import { DirectMessagesService } from '@v1/direct-messages/direct-messages.service';
import { LoginType, UserStatus } from './user.enum';
import { ResponseGetUserHomeDto } from './dtos/get-user-home.dto';
import { getFormatDate } from '@common/helpers/date.helper';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { DmUserType } from '@v1/direct-messages/direct-messages.enum';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly usersRepository: UsersRepository,
    private readonly directMessagesService: DirectMessagesService,
    private readonly emotionsRepository: EmotionsRepository,
  ) {}

  // 유저 홈 화면 조회
  async getUserHome(loginUser: Users, userId: number, isOwner: boolean): Promise<ResponseGetUserHomeDto> {

    try {
      const emotions = await this.emotionsRepository.getEmotions();
      if (isOwner) {
        const receivedDmList = await this.directMessagesService.getDmListByUserId(userId, { limit: 3 });
        const sentDmList = await this.directMessagesService.getDmListByUserId(userId, {type:DmUserType.SENT, limit: 3 });

        return {
          isOwner,
          loginUser: {
            id: loginUser.id,
            nickname: loginUser.nickname,
            email: loginUser.email,
          },
          receivedDmList: receivedDmList.map((dm) => {
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
              createdAt: getFormatDate(dm.createdAt),
            };
          }),
          sentDmList: sentDmList.map((dm) => {
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
              createdAt: getFormatDate(dm.createdAt),
            };
          }),
          emotions,
        };
      } else {
        const friend = await this.usersRepository.getUserById(userId);
        if (!friend) throw new NotFoundException('사용자를 찾을 수 없습니다.');

        return {
          isOwner,
          loginUser: {
            id: loginUser.id,
            nickname: loginUser.nickname,
            email: loginUser.email,
          },
          friendUser: {
            id: friend.id,
            nickname: friend.nickname,
          },
          emotions,
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('============== getUserHome error: ', error);
      throw new InternalServerErrorException('홈 화면을 가져오는 도중 오류가 발생했습니다.');
    }
  }

  // 유저 id 기준 받은/보낸 쪽지 리스트 조회
  async getDmListByUserId(loginUser: Users, userId: number, request: RequestGetDmListByUserIdDto): Promise<ResponseGetDmListByUserIdDto[] | null> {
    if (loginUser.id != userId) {
      throw new ForbiddenException('쪽지를 볼 권한이 없습니다.');
    }

    try {
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
          createdAt: getFormatDate(dm.createdAt),
        };
      });

      return parserData;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('============== getDmListByUserId error: ', error);
      throw new InternalServerErrorException('쪽지 리스트를 가져오는 도중 오류가 발생했습니다.');
    }
  }

  // 구글 로그인 유저 생성 또는 업데이트
  async createOrUpdateGoogleUser(googleUser: any): Promise<Users> {
    try {
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
    } catch (error) {
      this.logger.error('============== createOrUpdateGoogleUser error: ', error);
      throw new InternalServerErrorException('구글 로그인 및 업데이트 도중 오류가 발생했습니다.');
    }
  }

  // 회원 탈퇴
  async withdrawUser(userId: number): Promise<void> {
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      user.status = UserStatus.WITHDRAWN;

      await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('============== withdrawUser error: ', error);
      throw new InternalServerErrorException('탈퇴 도중 오류가 발생했습니다.');
    }
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
