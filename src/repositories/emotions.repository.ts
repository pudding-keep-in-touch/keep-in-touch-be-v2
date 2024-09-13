import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Repository } from 'typeorm';
import { Emotions } from './../entities/emotions.entity';

@CustomEntityRepository(Emotions)
export class EmotionsRepository extends Repository<Emotions> {
  async getEmotionByName(emotionName: string): Promise<Emotions | null> {
    return await this.findOne({ where: { name: emotionName } });
  }
}
