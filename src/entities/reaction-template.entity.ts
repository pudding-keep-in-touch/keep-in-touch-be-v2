import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reaction } from './reaction.entity';

@Entity({ name: 'reaction_templates' })
export class ReactionTemplate {
  @PrimaryGeneratedColumn({ name: 'reaction_template_id' })
  reactionTemplateId: number;

  @Column({ length: 10 })
  emoji: string;

  @Column({ length: 50 })
  content: string;

  @Column()
  type: number;

  @OneToMany(
    () => Reaction,
    (reaction) => reaction.reactionTemplate,
  )
  reactions: Reaction[];
}
