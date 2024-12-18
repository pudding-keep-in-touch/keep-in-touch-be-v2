import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { ReactionInfo } from '@entities/reaction-info.entity';
import { Reaction } from '@entities/reaction.entity';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

@CustomEntityRepository(Reaction)
export class ReactionRepository extends Repository<Reaction> {
  async createReactionsToMessage(messageId: string, reactionTemplateIds: string[]): Promise<string[]> {
    const reactions = reactionTemplateIds.map((reactionTemplateId) => {
      return this.create({
        messageId,
        reactionTemplateId,
      });
    });

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
