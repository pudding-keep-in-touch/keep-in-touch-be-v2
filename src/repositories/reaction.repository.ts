import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { ReactionInfo } from '@entities/reaction-info.entity';
import { Reaction } from '@entities/reaction.entity';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

@CustomEntityRepository(Reaction)
export class ReactionRepository extends Repository<Reaction> {
  /**
   * 주어진 messageId에 대해 주어진 reactionTemplateIds로 reaction, reactionInfo를 생성합니다.
   *
   * @param messageId
   * @param reactionTemplateIds
   * @returns
   */
  async createReactionsToMessage(messageId: string, reactionTemplateIds: string[]): Promise<string[]> {
    // entity 배열로 mapping
    const reactions = reactionTemplateIds.map((reactionTemplateId) => {
      return this.create({
        messageId,
        reactionTemplateId,
      });
    });

    /**
     * read_at, created_at을 관리하는 reaction info를 생성.
     */
    return this.manager.transaction(async (manager) => {
      const reactionInfo = await manager.findOne(ReactionInfo, { where: { messageId } });
      if (reactionInfo) {
        throw new ConflictException('이미 반응을 추가한 메시지입니다.');
      }
      const reaction = await manager.save(Reaction, reactions);
      await manager.insert(ReactionInfo, { messageId, createdAt: reaction[0].createdAt }); // reaction의 createdAt을 사용
      return reaction.map((r) => r.reactionId);
    });
  }
}
