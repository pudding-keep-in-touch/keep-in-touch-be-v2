import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'message_statistics' })
export class MessageStatistic {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'received_message_count', default: 0 })
  receivedMessageCount: number;

  @Column({ name: 'sent_message_count', default: 0 })
  sentMessageCount: number;

  @Column({ name: 'unread_message_count', default: 0 })
  unreadMessageCount: number;

  @Column({ name: 'unread_reaction_count', default: 0 })
  unreadReactionCount: number;
}
