import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { MessageRepository } from '@repositories/message.repository';
import { ReactionTemplateRepository } from '@repositories/reaction-template.repository';
import { ReactionRepository } from '@repositories/reaction.repository';

import { In } from 'typeorm';
import { ResponseReactionTemplates } from './dto/get-reaction-templates.dto';
import { toReactionTypeString } from './helpers/reactions.helper';

type CreateReactionToMessageParam = {
  messageId: string;
  userId: string;
  reactionTemplateIds: string[];
};

@Injectable()
export class ReactionsService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly reactionTemplateRepository: ReactionTemplateRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  /**
   * reaction template 전체를 조회합니다.
   * sorting 없음.
   *
   * @returns 조회한 템플릿 정보 배열
   */
  async getReactionTemplates(): Promise<ResponseReactionTemplates[]> {
    const templates = await this.reactionTemplateRepository.find();
    return templates.map((template) => ({
      reactionTemplateId: String(template.reactionTemplateId),
      emoji: template.emoji,
      content: template.content,
      type: toReactionTypeString(template.type),
    }));
  }

  /**
   * 쪽지에 반응을 추가합니다.
   *
   * @param messageId
   * @param reactionTemplateIds
   * @returns
   */
  async createReactionToMessage(param: CreateReactionToMessageParam) {
    const { messageId, userId, reactionTemplateIds } = param;
    // 내가 받은 message 인지 검증.
    const message = await this.messageRepository.findOne({
      where: {
        messageId,
        receiverId: userId,
      },
    });

    if (!message) {
      throw new NotFoundException('해당 쪽지를 찾을 수 없습니다.');
    }

    // 유효한 reaction template id인지 검증
    await this.validateReactionTemplateIds(reactionTemplateIds);

    // 이미 생성된 reaction이 있는지 확인
    const existingReaction = await this.reactionRepository.findOne({
      where: {
        messageId,
      },
    });
    if (existingReaction) {
      throw new ConflictException('이미 반응을 추가한 쪽지입니다.');
    }

    // reaction 생성
    const reactionIds = await this.reactionRepository.createReactionsToMessage(messageId, reactionTemplateIds);
    return {
      messageId: messageId,
      reactionIds: reactionIds,
    };
  }

  private async validateReactionTemplateIds(reactionTemplateIds: string[]) {
    // reaction template id가 존재하는지 확인
    const templates = await this.reactionTemplateRepository.find({
      where: {
        reactionTemplateId: In(reactionTemplateIds), // find options operator: IN
      },
    });

    if (templates.length !== reactionTemplateIds.length) {
      throw new BadRequestException('유효하지 않은 reaction template id가 포함되어 있습니다.');
    }
  }
}
