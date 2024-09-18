import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Emotions } from './emotions.entity';
import { Users } from './users.entity';

@Entity('direct_messages')
export class DirectMessage {
  @ApiProperty({
    description: '시퀀스 번호',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({
    description: '쪽지 내용',
    example: '사실 너에게 말하고 싶은게 있어',
  })
  @Column({
    type: 'varchar',
    name: 'content',
    nullable: false,
    length: 100,
  })
  content: string;

  @ApiProperty({ description: '쪽지 읽음 여부', example: false })
  @Column({
    type: 'boolean',
    name: 'is_read',
    nullable: false,
    default: false,
  })
  isRead: boolean;

  @ApiProperty({ description: '쪽지 삭제 여부', example: false })
  @Column({
    type: 'boolean',
    name: 'is_deleted',
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @ApiProperty({ description: '쪽지 생성 시각', example: '2024-09-10 00:00:00' })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '쪽지 수정 시각', example: '2024-09-10 00:00:00' })
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '보낸 사람 id',
    example: 1,
  })
  @ManyToOne(() => Users, (user) => user.id, { cascade: false, nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: Users;

  @ApiProperty({
    description: '받는 사람 id',
    example: 1,
  })
  @ManyToOne(() => Users, (user) => user.id, { cascade: false, nullable: false })
  @JoinColumn({ name: 'receiver_id' })
  receiver: Users;

  @ApiProperty({
    description: '감정 아이디',
    example: '1',
  })
  
  @OneToOne(() => Emotions, { cascade: false, nullable: false })
  @JoinColumn({ name: 'emotion_id' })
  emotion: Emotions;
}
