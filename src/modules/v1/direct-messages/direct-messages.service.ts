import { getFormatDate } from './../../../common/helpers/date.helper';
import { Emotions } from '@entities/emotions.entity';
import { Users } from '@entities/users.entity';
// import { DirectMessageGateway } from '@gateways/direct-message.gateway';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { UsersRepository } from '@repositories/users.repository';
import { CreateDmDto } from './dtos/create-dm.dto';
import { RequestGetDmListByUserIdDto } from './dtos/get-dm-list-by-user-id.dto';
import { DirectMessages } from '@entities/direct-messages.entity';
import { DirectMessage } from 'src/interfaces/direct-message.interface';

@Injectable()
export class DirectMessagesService {
  constructor(
    private readonly directMessageRepository: DirectMessagesRepository,
    private readonly userRepository: UsersRepository,
    private readonly emotionsRepository: EmotionsRepository, // private readonly directMessageGateway: DirectMessageGateway,
  ) {}

  // 로그인한 유저와 조회하려고 하는 메시지의 보낸 사람이 같은지 확인
  async checkDirectMessageOwnership(userId: number, senderId: number): Promise<boolean> {
    return userId === senderId;
  }

  // 받은 메시지 조회
  async getDmListByUserId(userId: number, request: RequestGetDmListByUserIdDto): Promise<DirectMessages[]> {
    return await this.directMessageRepository.getDmListByUserId(userId, request.type, request.page, request.limit, request.order);
  }

  // 메시지 상세 조회
  async getDmDetail(directMessageId: number, userId: number): Promise<DirectMessage> {
    const receivedDm = await this.directMessageRepository.getDmById(directMessageId);

    if (!receivedDm) {
      throw new BadRequestException('쪽지를 찾을 수 없습니다.');
    }

    const isOnwer = await this.checkDirectMessageOwnership(userId, receivedDm.sender.id);

    if (!isOnwer) {
      throw new ForbiddenException('쪽지를 볼 권한이 없습니다.');
    }

    return {
      id: receivedDm.id,
      senderId: receivedDm.sender.id,
      receiverId: receivedDm.receiver.id,
      content: receivedDm.content,
      emotion: {
        name: receivedDm.emotion.name,
        emoji: receivedDm.emotion.emoji,
      },
      isRead: true,
      comments: {},
      createdAt: getFormatDate(receivedDm.createdAt),
    };
  }

  // 메시지 전송
  async createDm(requestDto: CreateDmDto): Promise<{ dmId: number; receiverId: number }> {
    try {
      const existReceiver: Users = await this.userRepository.getUserByEmail(requestDto.receiverEmail);

      if (!existReceiver) {
        throw new BadRequestException('받는 사람을 찾을 수 없습니다.');
      }

      const emotion: Emotions = await this.emotionsRepository.getEmotionByName(requestDto.emotionName);

      if (!emotion) {
        throw new BadRequestException('감정을 찾을 수 없습니다.');
      }

      const newDm = await this.directMessageRepository.createDm(requestDto.senderId, existReceiver.id, emotion.id, requestDto.content);

      // 상대방에게 쪽지 도착 알림 전송
      // const notificationMessage = `새로운 쪽지가 도착했습니다: ${newDm.id}(보낸 사람 아이디: ${requestDto.sender_id})`;

      // this.directMessageGateway.sendNotificationToUser(existReceiver.id, notificationMessage);

      return { dmId: newDm.id, receiverId: existReceiver.id };
    } catch (error) {
      throw error;
    }
  }
}
