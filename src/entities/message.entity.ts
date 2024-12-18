import { MESSAGE_CONTENT_MAX } from '@modules/messages/constants/messages.constant';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Emotion } from './emotion.entity';
import { Question } from './question.entity';
import { ReactionInfo } from './reaction-info.entity';
import { Reaction } from './reaction.entity';
import { User } from './user.entity';

export enum MessageStatus {
  NORMAL = 1,
  HIDDEN = 2,
  REPORTED = 3,
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'message_id' })
  messageId: string;

  @Column({ type: 'varchar', length: MESSAGE_CONTENT_MAX })
  content: string;

  @Column({ type: 'smallint', default: MessageStatus.NORMAL })
  status: MessageStatus;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: string;

  @Column({ name: 'receiver_id', type: 'bigint' })
  receiverId: string;

  @Column({
    name: 'emotion_id',
    type: 'integer',
    nullable: true,
  })
  emotionId: string | null;

  @Column({ name: 'question_id', type: 'bigint', nullable: true })
  questionId: string | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

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
  emotion: Emotion | null;

  @ManyToOne(
    () => Question,
    (question) => question.messages,
    { nullable: true },
  )
  @JoinColumn({ name: 'question_id' })
  question: Question | null;

  @OneToMany(
    () => Reaction,
    (reaction) => reaction.message,
  )
  reactions: Reaction[];

  @OneToOne(
    () => ReactionInfo,
    (reactionInfo) => reactionInfo.message,
  )
  reactionInfo: ReactionInfo;
}
