import { Repository } from 'typeorm';

import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Emotion } from '@entities/emotion.entity';

@CustomEntityRepository(Emotion)
export class EmotionRepository extends Repository<Emotion> {
  async findEmotionById(id: string): Promise<Emotion | null> {
    return this.findOne({ where: { emotionId: id } });
  }
}
