import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageStatistic } from './message-statistic.entity';
import { Message } from './message.entity';
import { Question } from './question.entity.entity';

export enum LoginType {
  EMAIL = 1,
  GOOGLE = 2,
  NAVER = 3,
  KAKAO = 4,
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ length: 20, nullable: true })
  nickname: string;

  @Column({ nullable: true })
  age: number;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ name: 'login_type', type: 'smallint' })
  loginType: LoginType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToMany(
    () => Question,
    (question) => question.user,
  )
  questions: Question[];

  @OneToMany(
    () => Message,
    (message) => message.sender,
  )
  sentMessages: Message[];

  @OneToMany(
    () => Message,
    (message) => message.receiver,
  )
  receivedMessages: Message[];

  @OneToOne(() => MessageStatistic)
  messageStatistic: MessageStatistic;
}
