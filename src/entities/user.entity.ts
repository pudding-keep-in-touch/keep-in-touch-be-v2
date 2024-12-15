import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MessageStatistic } from './message-statistic.entity';
import { Message } from './message.entity';
import { Question } from './question.entity';

export enum LoginType {
  EMAIL = 1,
  GOOGLE = 2,
  NAVER = 3,
  KAKAO = 4,
}

@Entity({ name: 'users' })
@Unique(['email', 'loginType'])
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 20 })
  nickname: string;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ name: 'login_type', type: 'smallint' })
  loginType: LoginType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

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
