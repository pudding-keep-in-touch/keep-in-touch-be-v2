import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { ReactionTemplate } from '@entities/reaction-template.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(ReactionTemplate)
export class ReactionTemplateRepository extends Repository<ReactionTemplate> {
  /**
   * 모든 reaction template을 조회한다.
   * @returns reaction template list
   */
  async getReactionTemplates(): Promise<ReactionTemplate[]> {
    return this.find();
  }
}
