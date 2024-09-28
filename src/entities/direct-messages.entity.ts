import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Emotions } from './emotions.entity';
import { Users } from './users.entity';

@Entity('direct_messages')
export class DirectMessages {
  @ApiProperty({
    description: '시퀀스 번호',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({ description: '쪽지 보내는 유저 시퀀스 번호', example: 1 })
  @Column({
    type: 'bigint',
    name: 'sender_id',
    nullable: false,
    unsigned: true,
  })
  senderId: number

  @ApiProperty({ description: '쪽지 받는 유저 시퀀스 번호', example: 1 })
  @Column({
    type: 'bigint',
    name: 'receiver_id',
    nullable: false,
    unsigned: true,
  })
  receiverId: number

  @ApiProperty({ description: '감정 고유 번호', example: 1 })
  @Column({
    type: 'int',
    name: 'emotion_id',
    nullable: false,
  })
  emotionId: number

  @ApiProperty({
    description: '쪽지 내용',
    example: '사실 너에게 말하고 싶은게 있어',
  })
  @Column({
    type: 'varchar',
    name: 'content',
    nullable: false,
    length: 200,
  })
  content: string;

  @ApiProperty({ description: '쪽지 읽음 여부', example: false, required: false })
  @Column({
    type: 'boolean',
    name: 'is_read',
    nullable: false,
    default: false,
  })
  isRead: boolean;

  @ApiProperty({ description: '쪽지 삭제 여부', example: false, required: false })
  @Column({
    type: 'boolean',
    name: 'is_deleted',
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @ApiProperty({ description: '쪽지 생성 시각', example: '2024-09-10 00:00:00', required: false })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '쪽지 수정 시각', example: '2024-09-10 00:00:00', required: false })
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.id, { cascade: false, nullable: false })
  @JoinColumn({ name: 'sender_id', referencedColumnName: "id" })
  sender: Users;

  @ManyToOne(() => Users, (user) => user.id, { cascade: false, nullable: false })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: "id" })
  receiver: Users;

  @OneToOne(() => Emotions, { cascade: false, nullable: false })
  @JoinColumn({ name: 'emotion_id', referencedColumnName: 'id' })
  emotion: Emotions;
}
