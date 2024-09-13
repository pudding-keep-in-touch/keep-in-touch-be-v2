import { Emotions } from '@entities/emotions.entity';
import { Users } from '@entities/users.entity';
import { DirectMessageGateway } from '@gateways/direct-message.gateway';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { UsersRepository } from '@repositories/users.repository';
import { CreateDmDto } from './dtos/create-dm.dto';
import { RequestGetDmDetailDto } from './dtos/get-dm-detail.dto';

@Injectable()
export class DirectMessagesService {
  constructor(
    private readonly directMessageRepository: DirectMessagesRepository,
    private readonly userRepository: UsersRepository,
    private readonly emotionsRepository: EmotionsRepository,
    private readonly directMessageGateway: DirectMessageGateway,
  ) {}
  // 받은 메시지 조회
  async getReceivedDmListByUserId() {
    return {};
  }

  // 보낸 메시지 조회

  // 메시지 상세 조회
  async getDmDetail(directMessageId: number, request: RequestGetDmDetailDto): Promise<any> {
    // user id 조회
    if (request.type === 'received') {
      return {
        id: directMessageId,
        senderId: 10,
        receiverId: 12,
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
      };
    }
  }

  // 메시지 전송
  async createDm(requestDto: CreateDmDto) {
    try {
      const existReceiver: Users = await this.userRepository.getUserByEmail(requestDto.receiver_email);

      if (!existReceiver) {
        throw new NotFoundException('받는 사람을 찾을 수 없습니다.');
      }

      const emotion: Emotions = await this.emotionsRepository.getEmotionByName(requestDto.emotion_name);

      if (!emotion) {
        throw new NotFoundException('감정을 찾을 수 없습니다.');
      }

      const newDm = await this.directMessageRepository.createDm(requestDto.sender_id, existReceiver.id, emotion.id, requestDto.content);

      // 상대방에게 쪽지 도착 알림 전송
      const notificationMessage = `새로운 쪽지가 도착했습니다: ${newDm.id}(보낸 사람 아이디: ${requestDto.sender_id})`;

      this.directMessageGateway.sendNotificationToUser(existReceiver.id, notificationMessage);

      return { dmId: newDm.id };
    } catch (error) {
      throw error;
    }
  }
}
