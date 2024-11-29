import { QUESTION_CONTENT_MAX } from '@modules/questions/constants/question.constant';
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
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn({ name: 'question_id', type: 'bigint' })
  questionId: string;

  @ManyToOne(
    () => User,
    (user) => user.questions,
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar', length: QUESTION_CONTENT_MAX }) // 140
  content: string;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => Message,
    (message) => message.question,
  )
  messages: Message[];
}
