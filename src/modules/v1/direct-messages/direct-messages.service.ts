import { getFormatDate } from '@common/helpers/date.helper';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { CreateDmDto } from './dtos/create-dm.dto';
import { RequestGetDmListByUserIdDto } from './dtos/get-dm-list-by-user-id.dto';
import { DirectMessages } from '@entities/direct-messages.entity';
import { DirectMessage } from 'src/interfaces/direct-message.interface';

@Injectable()
export class DirectMessagesService {
  constructor(private readonly directMessageRepository: DirectMessagesRepository) {}

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
  async createDm(senderId: number, requestDto: CreateDmDto): Promise<{ dmId: number }> {
    if(senderId === requestDto.receiverId) throw new BadRequestException("쪽지를 보낼 수 없습니다.");
    
    try {
      const { receiverId, emotionId, content } = requestDto;

      const newDm = await this.directMessageRepository.createDm(senderId, receiverId, emotionId, content);

      return { dmId: newDm.id };
    } catch (error) {
      throw error;
    }
  }
}
