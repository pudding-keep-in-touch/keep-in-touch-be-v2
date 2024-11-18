import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Emotions } from './emotions.entity';

@Entity({ name: 'emotion_details', schema: 'v1' })
export class EmotionDetails {
  @ApiProperty({ description: '시퀀스 번호', example: 1 })
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @ApiProperty({ description: '감정 상세 이모지', example: '🥰' })
  @Column({
    type: 'varchar',
    name: 'emoji',
    nullable: false,
    length: 10,
  })
  emoji: string;

  @ApiProperty({ description: '감정 상세 이름', example: '너무 고마워' })
  @Column({
    type: 'varchar',
    name: 'name',
    nullable: false,
    length: 20,
  })
  name: string;

  @ApiProperty({ description: '이모지 번호', example: 1 })
  @OneToOne(() => Emotions, { cascade: true })
  @JoinColumn({ name: 'emotion_id' })
  emotion: Emotions; // eager loading vs lazy loading
}
