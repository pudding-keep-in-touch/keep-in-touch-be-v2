import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity.entity';
import { ReactionTemplate } from './reaction-template.entity';

@Entity({ name: 'reactions' })
export class Reaction {
  @PrimaryGeneratedColumn({ name: 'reaction_id', type: 'bigint' })
  reactionId: number;

  @ManyToOne(
    () => Message,
    (message) => message.reactions,
  )
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(
    () => ReactionTemplate,
    (template) => template.reactions,
  )
  @JoinColumn({ name: 'reaction_template_id' })
  reactionTemplate: ReactionTemplate;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
