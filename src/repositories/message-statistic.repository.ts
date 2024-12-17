import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { MessageStatistic } from '@entities/message-statistic.entity';

@CustomEntityRepository(MessageStatistic)
export class MessageStatisticRepository extends Repository<MessageStatistic> {}
