import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { PaginationOption } from '@common/types/pagination-option.type';
//import { MessageStatistic } from '@entities/message-statistic.entity';
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
  async findMessageDetailById(messageId: string, userId: string): Promise<Message | null> {
    return this.manager.transaction(async (manager) => {
      // Repository 대신 EntityManager 사용
      const message = await manager.findOne(Message, {
        where: { messageId },
        relations: ['receiver', 'question', 'emotion', 'reactions', 'reactions.reactionTemplate'],
      });

      if (!message) {
        return null;
      }
      // 읽음 처리
      // FIXME: 이걸 insert into..로...? 변경
      if (message.receiverId === userId && message.readAt === null) {
        await manager.update(Message, { messageId }, { readAt: () => 'CURRENT_TIMESTAMP' });
        //await manager.update(
        //  MessageStatistic,
        //  { userId: userId },
        //  {
        //    unreadMessageCount: () => 'unreadMessageCount - 1',
        //  },
        //);
      }
      return message;
    });
  }

  /**
   *
   *
   * @param userId 조회할 유저의 id (senderId 또는 receiverId)
   * @param options cursor, limit, order
   * @param type sent or received
   * @returns
   */
  async findMessagesByUserId(userId: string, type: MessageType, options: PaginationOption): Promise<Message[]> {
    const { cursor, limit, order } = options;

    /**
     * type에 따라 receiverId 또는 senderId로 조회합니다.
     * cursor가 주어진 경우 cursor 이전의 데이터를 조회합니다.
     * limit만큼 조회하고, order에 따라 정렬합니다.
     */
    const query = this.createQueryBuilder('message')
      .innerJoin('message.receiver', 'receiver')
      .addSelect(['receiver.nickname', 'receiver.userId'])
      .where(cursor ? 'message.createdAt < :cursor' : '1=1', { cursor })
      .orderBy('message.createdAt', order)
      .addOrderBy('message.messageId', order) // timestamp 같을 때를 위한 보조 정렬 추가
      .take(limit + 1); // limit + 1을 해서 다음 페이지가 있는지 확인합니다.

    if (type === 'sent') {
      query.leftJoin('message.reactionInfo', 'reactionInfo');
      query.addSelect(['reactionInfo.readAt', 'reactionInfo.createdAt']);
      query.andWhere('message.senderId = :userId', { userId });
    } else {
      query.andWhere('message.receiverId = :userId', { userId });
    }
    return query.getMany();
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
      // 나중에 데이터가 쌓이면 EXPLAIN ANALYZE 등을 이용하여 실제 시간을 체크해 볼 필요가 있음.s

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
