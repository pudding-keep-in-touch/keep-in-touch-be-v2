import { ReactionTemplateType } from '@entities/reaction-template.entity';
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
  return REACTION_TYPE_MAPPING[type];
}
