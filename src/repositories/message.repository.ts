import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { MessageStatistic } from '@entities/message-statistic.entity';
import { Message } from '@entities/message.entity';
import { CreateEmotionMessageParam, CreateQuestionMessageParam } from '@modules/messages/types/messages.type';
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
    return this.createQueryBuilder('message')
      .innerJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.question', 'question')
      .leftJoinAndSelect('message.emotion', 'emotion')
      .leftJoinAndSelect('message.reactions', 'reaction')
      .leftJoinAndSelect('reaction.reactionTemplate', 'template')
      .where('message.messageId = :messageId', { messageId })
      .getOne();
  }

  /**
   * 쪽지를 생성하고 생성된 쪽지의 id를 반환합니다.
   *
   * @param param senderId, receiverId, content와 함께 questionId 또는 emotionId
   * @returns 생성된 쪽지의 id
   */
  private async createMessage(message: CreateQuestionMessageParam | CreateEmotionMessageParam): Promise<string> {
    const { senderId, receiverId } = message;

    const messageId = await this.manager.transaction(async (manager) => {
      const messageResult = await manager.getRepository(Message).insert(message);

      // sender의 sentMessageCount를 1 증가시키고, receiver의 receivedMessageCount와 unreadMessageCount를 1 증가시킵니다.
      // 순서 상관없으므로 Promise.all을 사용합니다.
      // NOTE: transaction 정말 필요한지? 통계 연산이 실패했다고 쪽지 생성이 실패해야 하는가?
      await Promise.all([
        manager
          .getRepository(MessageStatistic)
          .update({ userId: senderId }, { sentMessageCount: () => 'sent_message_count + 1' }),
        manager.getRepository(MessageStatistic).update(
          { userId: receiverId },
          {
            receivedMessageCount: () => 'received_message_count + 1',
            unreadMessageCount: () => 'unread_message_count + 1',
          },
        ),
      ]);

      return messageResult.identifiers[0].messageId;
    });
    return messageId;
  }
}
