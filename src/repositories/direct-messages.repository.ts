import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { DirectMessages } from '@entities/direct-messages.entity';
import { DmUserType } from '@v1/direct-messages/direct-messages.enum';
import { Repository } from 'typeorm';

@CustomEntityRepository(DirectMessages)
export class DirectMessagesRepository extends Repository<DirectMessages> {
  // 쪽지 id 기준 조회
  async getDmById(dmId: number): Promise<DirectMessages | null> {
    return await this.findOne({ where: { id: dmId }, relations: ['sender', 'receiver', 'emotion'] });
  }

  // 유저 id 기준 쪽지 리스트 조회
  async getDmListByUserId(
    userId: number,
    type: DmUserType,
    page: number = 1,
    limit: number = 10,
    order: 'desc' | 'asc' = 'desc',
  ): Promise<DirectMessages[] | null> {
    const skip = (page - 1) * limit;
    const take = limit;
    const userField = type === DmUserType.RECEIVED ? 'receiver' : 'sender';

    return await this.find({
      where: { [userField]: { id: userId }, isDeleted: false },
      relations: ['sender', 'receiver', 'emotion'],
      skip,
      take,
      order: { createdAt: order },
    });
  }

  // 쪽지 생성
  async createDm(senderId: number, receiverId: number, emotionId: number, content: string): Promise<DirectMessages> {
    const sender = await this.manager.findOne('Users', { where: { id: senderId } });
    const receiver = await this.manager.findOne('Users', { where: { id: receiverId } });
    const emotion = await this.manager.findOne('Emotions', { where: { id: emotionId } });

    return await this.save({ sender, receiver, emotion, content });
  }
}