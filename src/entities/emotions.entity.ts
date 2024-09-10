import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('emotion')
export class Emotions {
  @ApiProperty({ description: '시퀀스 번호', example: 1 })
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @ApiProperty({ description: '감정 이름', example: '응원과 감사' })
  @Column({
    type: 'varchar',
    name: 'name',
    nullable: false,
    length: 50,
  })
  name: string;

  @ApiProperty({ description: '감정 이모지', example: '🙏' })
  @Column({
    type: 'varchar',
    name: 'emoji',
    nullable: false,
    length: 10,
  })
  emoji: string;
}
