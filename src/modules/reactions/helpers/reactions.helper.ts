import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { ReactionTypeString } from '../types/reactions.type';

/**
 * ReactionTemplateType enum을 한글 상태값으로 변환하기 위한 매핑
 * @example REACTION_TYPE_MAPPING[ReactionTemplateType.THANKS] === '감사'
 */
const REACTION_TYPE_MAPPING = {
  [ReactionTemplateType.THANKS]: '감사',
  [ReactionTemplateType.APOLOGY]: '사과',
  [ReactionTemplateType.CHEER_UP]: '응원',
  [ReactionTemplateType.RECONCILIATION]: '화해',
} as const;

export function toReactionTypeString(type: ReactionTemplateType): ReactionTypeString {
  const reactionTypeString = REACTION_TYPE_MAPPING[type];

  // DB에서 온 값이 enum에 정의되지 않은 값인 경우 (ex: 0)
  if (!reactionTypeString) {
    throw new InternalServerErrorException(
      `Invalid reaction type in database: ${type}. Expected one of: ${Object.values(ReactionTemplateType).join(', ')}`,
    );
  }

  return reactionTypeString;
}
