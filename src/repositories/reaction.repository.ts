import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Reaction } from '@entities/reaction.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(Reaction)
export class ReactionRepository extends Repository<Reaction> {
  //
  async createReactionsToMessage(messageId: string, reactionTemplateIds: string[]): Promise<string[]> {
    const reactions = reactionTemplateIds.map((reactionTemplateId) => {
      return this.create({
        messageId,
        reactionTemplateId,
      });
    });

    // bulk insert
    const result = await this.insert(reactions);
    return result.identifiers.map((id) => id.reactionId);
  }
}
