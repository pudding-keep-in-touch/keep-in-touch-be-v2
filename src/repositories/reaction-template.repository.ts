import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { ReactionTemplate } from '@entities/reaction-template.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(ReactionTemplate)
export class ReactionTemplateRepository extends Repository<ReactionTemplate> {}
