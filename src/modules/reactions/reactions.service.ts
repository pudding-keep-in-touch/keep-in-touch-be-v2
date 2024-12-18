import { Injectable } from '@nestjs/common';
import { ReactionTemplateRepository } from '@repositories/reaction-template.repository';
import { GetReactionTemplatesDto } from './dto/get-reaction-templates.dto';
import { toReactionTypeString } from './helpers/reactions.helper';

@Injectable()
export class ReactionsService {
  constructor(private readonly reactionTemplateRepository: ReactionTemplateRepository) {}

  /**
   * reaction template 전체를 조회합니다.
   * sorting 없음.
   *
   * @returns
   */
  async getReactionTemplates(): Promise<GetReactionTemplatesDto[]> {
    const templates = this.reactionTemplateRepository.getReactionTemplates();
    return (await templates).map((template) => ({
      reactionTemplateId: String(template.reactionTemplateId),
      emoji: template.emoji,
      content: template.content,
      type: toReactionTypeString(template.type),
    }));
  }
}
