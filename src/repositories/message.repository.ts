import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Message } from '@entities/message.entity';

@CustomEntityRepository(Message)
export class MessageRepository extends Repository<Message> {}
