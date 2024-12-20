import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { ReactionInfo } from '@entities/reaction-info.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(ReactionInfo)
export class ReactionInfoRepository extends Repository<ReactionInfo> {}
