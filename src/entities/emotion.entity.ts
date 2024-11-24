import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity({ name: 'emotions' })
export class Emotion {
  @PrimaryGeneratedColumn({ name: 'emotion_id', type: 'integer' })
  emotionId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10 })
  emoji: string;

  @OneToMany(
    () => Message,
    (message) => message.emotion,
  )
  messages: Message[];
}
