import { CustomEntityRepository } from '@common/custom-typeorm/custom-typeorm.decorator';
import { Emotions } from '@entities/emotions.entity';
import { Repository } from 'typeorm';

@CustomEntityRepository(Emotions)
export class EmotionsRepository extends Repository<Emotions> {
  async getEmotionById(emotionId: number): Promise<Emotions | null> {
    return await this.findOne({ where: { id: emotionId } });
  }

  async getEmotions(): Promise<Emotions[]> {
    return await this.find();
  }
}
