import { ConflictException, Injectable } from '@nestjs/common';
import { RequestGetDmListByUserIdDto, ResponseGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { RequestSignUpDto } from './dtos/signup.dto';
import { UsersRepository } from '@repositories/users.repository';
import * as bcrypt from 'bcrypt';
import { Users } from '@entities/users.entity';
import { DirectMessagesService } from '@v1/direct-messages/direct-messages.service';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly directMessagesService: DirectMessagesService) {}

  // 회원가입
  async signup(requestDto: RequestSignUpDto): Promise<Users> {
    // 이메일이 존재하는지 조회
    const existingUser = await this.usersRepository.getUserByEmail(requestDto.email);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 존재하지 않으면 유저 생성
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(requestDto.password, salt);

    return await this.usersRepository.createUser(requestDto.email, hashedPassword, 1);
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
        createdAt: dm.createdAt, //FIXME 시간 포맷 변경 필요
      };
    });

    return parserData;
  }

  // 이메일 조회
  async findByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.getUserByEmail(email);
  }

  async createOrUpdateGoogleUser(googleUser: any): Promise<Users> {
    let user = await this.findByEmail(googleUser.email);

    if (!user) {
      // 새 사용자 생성
      user = this.usersRepository.create({
        email: googleUser.email,
        nickname: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
        loginType: 2, // 구글 로그인 타입
        status: 1, // 활성 상태
      });
    } else {
      // 기존 사용자 정보 업데이트
      user.nickname = `${googleUser.firstName} ${googleUser.lastName}`.trim();
      user.loginType = 2; // 구글 로그인으로 업데이트
    }

    return await this.usersRepository.save(user);
  }
}
