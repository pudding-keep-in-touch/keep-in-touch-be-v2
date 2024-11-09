import { getFormatDate } from '@common/helpers/date.helper';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DirectMessagesRepository } from '@repositories/direct-messages.repository';
import { CreateDmDto } from './dtos/create-dm.dto';
import { RequestGetDmListByUserIdDto } from './dtos/get-dm-list-by-user-id.dto';
import { DirectMessages } from '@entities/direct-messages.entity';
import { UsersRepository } from '@repositories/users.repository';
import { EmotionsRepository } from '@repositories/emotions.repository';
import { DirectMessage } from 'src/interfaces/direct-message.interface';

@Injectable()
export class DirectMessagesService {
  constructor(
    private readonly directMessagesRepository: DirectMessagesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly emotionsRepository: EmotionsRepository,
  ) {}

  // 로그인한 유저와 조회하려고 하는 메시지의 보낸/받은 사람이 같은지 확인
  async checkDirectMessageOwnership(userId: number, senderId: number, receiverId: number): Promise<boolean> {
    return userId === senderId || userId === receiverId;
  }

  // 받은 메시지 조회
  async getDmListByUserId(userId: number, request: RequestGetDmListByUserIdDto): Promise<DirectMessages[]> {
    return await this.directMessagesRepository.getDmListByUserId(
      userId,
      request.type,
      request.page,
      request.limit,
      request.order,
    );
  }

  // 보낸/받은 메시지 상세 조회
  async getDmDetail(directMessageId: number, userId: number): Promise<DirectMessage & { receiverNickname: string }> {
    const receivedDm = await this.directMessagesRepository.getDmById(directMessageId);

    if (!receivedDm) {
      throw new NotFoundException('쪽지를 찾을 수 없습니다.');
    }

    const isOnwer = await this.checkDirectMessageOwnership(userId, receivedDm.sender.id, receivedDm.receiver.id);

    if (!isOnwer) {
      throw new ForbiddenException('쪽지를 볼 권한이 없습니다.');
    }

    const updatedDm = await this.directMessagesRepository.updateIsRead(receivedDm, true);

    return {
      id: updatedDm.id,
      senderId: updatedDm.sender.id,
      receiverId: updatedDm.receiver.id,
      receiverNickname: updatedDm.receiver.nickname,
      content: updatedDm.content,
      emotion: {
        name: updatedDm.emotion.name,
        emoji: updatedDm.emotion.emoji,
      },
      isRead: updatedDm.isRead,
      comments: {},
      createdAt: getFormatDate(updatedDm.createdAt),
    };
  }

  // 메시지 전송
  async createDm(senderId: number, requestDto: CreateDmDto): Promise<{ dmId: number }> {
    if (senderId === requestDto.receiverId)
      throw new BadRequestException('쪽지를 보내는 사람과 받는 사람이 동일합니다.');

    const receiverUser = await this.usersRepository.getUserById(requestDto.receiverId);

    if (!receiverUser) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const emotion = await this.emotionsRepository.getEmotionById(requestDto.emotionId);

    if (!emotion) throw new NotFoundException('감정을 찾을 수 없습니다.');

    const newDm = {
      content: requestDto.content,
      senderId: senderId,
      receiverId: requestDto.receiverId,
      emotionId: requestDto.emotionId,
      isRead: false,
      isDeleted: false,
    };

    const dm = await this.directMessagesRepository.createDm(newDm);

    return { dmId: dm.id };
  }
}
