import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Emotion } from '@entities/emotion.entity';

@CustomEntityRepository(Emotion)
export class EmotionRepository extends Repository<Emotion> {
  findEmotionById(id: string) {
    return this.findOne({ where: { emotionId: id } });
  }
}
