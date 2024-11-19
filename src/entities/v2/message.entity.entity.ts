import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Emotion } from './emotion.entity';
import { Question } from './question.entity.entity';
import { Reaction } from './reaction.entity';
import { User } from './user.entity';

export const MESSAGE_STATUS = {
  NORMAL: 1,
  HIDDEN: 2,
  REPORTED: 3,
};

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'message_id' })
  messageId: number;

  @Column({ length: 200 })
  content: string;

  @Column({ type: 'smallint', default: MESSAGE_STATUS.NORMAL })
  status: number;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'bigint' })
  receiverId: number;

  @Column({ name: 'emotion_id', nullable: true })
  emotionId: number;

  @Column({ name: 'question_id', type: 'bigint', nullable: true })
  questionId: number;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(
    () => User,
    (user) => user.sentMessages,
  )
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(
    () => User,
    (user) => user.receivedMessages,
  )
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(
    () => Emotion,
    (emotion) => emotion.messages,
    { nullable: true },
  )
  @JoinColumn({ name: 'emotion_id' })
  emotion: Emotion;

  @ManyToOne(
    () => Question,
    (question) => question.messages,
    { nullable: true },
  )
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToMany(
    () => Reaction,
    (reaction) => reaction.message,
  )
  reactions: Reaction[];
}