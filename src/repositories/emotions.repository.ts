import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Emotions } from '@entities/emotions.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(Emotions)
export class EmotionsRepository extends Repository<Emotions> {
  async getEmotionByName(emotionName: string): Promise<Emotions | null> {
    return await this.findOne({ where: { name: emotionName } });
  }

  async getEmotions(): Promise<Emotions[]> {
    return await this.find();
  }
}
