import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { PaginationOption } from '@common/types/pagination-option.type';
import { Message } from '@entities/message.entity';
import {
  CreateEmotionMessageParam,
  CreateQuestionMessageParam,
  MessageType,
} from '@modules/messages/types/messages.type';
@CustomEntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  /**
   * question에 관련된 쪽지를 생성하고 생성된 쪽지의 id를 반환합니다.
   *
   * @param message senderId, receiverId, questionId, content
   * @returns 생성된 쪽지의 id
   */
  async createQuestionMessage(message: CreateQuestionMessageParam): Promise<string> {
    return this.createMessage(message);
  }

  /**
   * emotion에 관련된 쪽지를 생성하고 생성된 쪽지의 id를 반환합니다.
   *
   * @param message senderId, receiverId, emotionId, content
   * @returns
   */
  async createEmotionMessage(message: CreateEmotionMessageParam): Promise<string> {
    return this.createMessage(message);
  }

  // TODO: join 개선
  /**
   * messageId에 해당하는 쪽지의 상세 정보를 조회합니다.
   *
   * @param messageId select 할 message의 id
   * @returns
   */
  async findMessageDetailById(messageId: string): Promise<Message | null> {
    return this.findOne({
      where: { messageId },
      relations: ['receiver', 'question', 'emotion', 'reactions', 'reactions.reactionTemplate'],
    });
  }

  async updateMessageReadAt(messageId: string): Promise<void> {
    await this.update({ messageId }, { readAt: () => 'CURRENT_TIMESTAMP' });
  }

  /**
   * 유저가 보낸/받은 메시지를 조회합니다.
   *
   * @param userId 조회할 유저의 id (senderId 또는 receiverId)
   * @param type sent or received
   * @param options cursor, limit, order
   * @returns Promise<Message[]>
   */
  async findMessagesByUserId(userId: string, type: MessageType, options: PaginationOption): Promise<Message[]> {
    return type === 'received' ? this.findReceivedMessages(userId, options) : this.findSentMessages(userId, options);
  }

  /**
   * 받은 메시지를 조회합니다.
   * 메세지 생성일자를 기준으로 정렬합니다.
   *
   * @param userId 조회할 유저의 id
   * @param param1 cursor, limit, order
   * @returns
   */
  private async findReceivedMessages(userId: string, { cursor, limit, order }: PaginationOption): Promise<Message[]> {
    return this.createQueryBuilder('message')
      .innerJoin('message.receiver', 'receiver')
      .addSelect(['receiver.nickname', 'receiver.userId'])
      .where(cursor ? 'message.createdAt < :cursor' : '1=1', { cursor })
      .andWhere('message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', order)
      .addOrderBy('message.messageId', order)
      .take(limit + 1)
      .getMany();
  }

  /**
   * 보낸 메시지를 조회합니다.
   * 반응이 있는 메세지는 반응의 생성일자를 기준으로 정렬하고, 반응이 없는 메세지는 메세지 생성일자를 기준으로 정렬합니다.
   *
   * @param userId 조회할 유저의 id
   * @param param1 cursor, limit, order
   * @returns
   */
  private async findSentMessages(userId: string, { cursor, limit, order }: PaginationOption): Promise<Message[]> {
    const baseQuery = this.createQueryBuilder('message')
      .innerJoin('message.receiver', 'receiver')
      .addSelect(['receiver.nickname', 'receiver.userId'])
      .addSelect(['reactionInfo.createdAt', 'reactionInfo.readAt'])
      .where('message.senderId = :userId', { userId })
      .take(limit + 1);

    // 1. reaction이 있는 메시지 조회
    const withReactions = await baseQuery
      .clone()
      .innerJoin('message.reactionInfo', 'reactionInfo')
      .andWhere(cursor ? 'reactionInfo.createdAt < :cursor' : '1=1', { cursor })
      .orderBy('reactionInfo.createdAt', order)
      .addOrderBy('message.messageId', order)
      .getMany();

    // 2. reaction이 없는 메시지 조회
    const withoutReactions = await baseQuery
      .clone()
      .leftJoin('message.reactionInfo', 'reactionInfo')
      .andWhere('reactionInfo.messageId IS NULL')
      .andWhere(cursor ? 'message.createdAt < :cursor' : '1=1', { cursor })
      .orderBy('message.createdAt', order)
      .addOrderBy('message.messageId', order)
      .getMany();

    // 3. 결과 합치기
    const allSentMessages = [...withReactions, ...withoutReactions];
    return allSentMessages
      .sort((a, b) => {
        const timeA = a.reactionInfo?.createdAt ?? a.createdAt;
        const timeB = b.reactionInfo?.createdAt ?? b.createdAt;

        return timeB.getTime() - timeA.getTime();
      })
      .slice(0, limit + 1);
  }

  /**
   * 쪽지를 생성하고 생성된 쪽지의 id를 반환합니다.
   *
   * @param param senderId, receiverId, content와 함께 questionId 또는 emotionId
   * @returns 생성된 쪽지의 id
   */
  private async createMessage(message: CreateQuestionMessageParam | CreateEmotionMessageParam): Promise<string> {
    //const { senderId, receiverId } = message;

    const messageId = await this.manager.transaction(async (manager) => {
      const messageResult = await manager.getRepository(Message).insert(message);

      // sender의 sentMessageCount를 1 증가시키고, receiver의 receivedMessageCount와 unreadMessageCount를 1 증가시킵니다.
      // 순서 상관없으므로 Promise.all을 사용합니다.
      // NOTE: transaction 정말 필요한지? 통계 연산이 실패했다고 쪽지 생성이 실패해야 하는가?
      // NOTE : +1, -1 등의 연산으로 update하는 것보다 insert 하고 나중에 계산하는 방식이 좀 더 안전하다고 판단되어 create 시 통계 연산 삭제.
      // sent, received total count가 필요한 경우는 COUNT를 사용하고 있음.
      // 나중에 데이터가 쌓이면 EXPLAIN ANALYZE 등을 이용하여 실제 시간을 체크해 볼 필요가 있음.

      //await Promise.all([
      //  manager
      //    .getRepository(MessageStatistic)
      //    .update({ userId: senderId }, { sentMessageCount: () => 'sent_message_count + 1' }),
      //  manager.getRepository(MessageStatistic).update(
      //    { userId: receiverId },
      //    {
      //      receivedMessageCount: () => 'received_message_count + 1',
      //      unreadMessageCount: () => 'unread_message_count + 1',
      //    },
      //  ),
      //]);

      return messageResult.identifiers[0].messageId;
    });
    return messageId;
  }
}
