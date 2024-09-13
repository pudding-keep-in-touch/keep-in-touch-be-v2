import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { DirectMessage } from '@entities/direct-messages.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(DirectMessage)
export class DirectMessagesRepository extends Repository<DirectMessage> {
  // 쪽지 id 기준 조회
  async getDmById(dmId: number): Promise<DirectMessage | null> {
    return await this.findOne({ where: { id: dmId } });
  }

  // 쪽지 생성
  async createDm(senderId: number, receiverId: number, emotionId: number, content: string): Promise<DirectMessage> {
    return await this.save({ senderId, receiverId, emotionId, content });
  }
}
