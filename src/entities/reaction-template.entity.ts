import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reaction } from './reaction.entity';

// 감사, 사과, 응원, 화해
export enum ReactionTemplateType {
  THANKS = 1,
  APOLOGY = 2,
  CHEER_UP = 3,
  RECONCILIATION = 4,
}

@Entity({ name: 'reaction_templates' })
export class ReactionTemplate {
  @PrimaryGeneratedColumn({ name: 'reaction_template_id', type: 'integer' })
  reactionTemplateId: string;

  @Column({ type: 'varchar', length: 10 })
  emoji: string;

  @Column({ type: 'varchar', length: 50 })
  content: string;

  @Column({ type: 'smallint' })
  type: ReactionTemplateType;

  @OneToMany(
    () => Reaction,
    (reaction) => reaction.reactionTemplate,
  )
  reactions: Reaction[];
}
