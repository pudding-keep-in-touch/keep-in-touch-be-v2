import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity({ name: 'reaction_info' })
export class ReactionInfo {
  @PrimaryColumn({ name: 'message_id', type: 'bigint' })
  @JoinColumn({ name: 'message_id' })
  messageId: string;

  @OneToOne(
    () => Message,
    (message) => message.reactionInfo,
  )
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
