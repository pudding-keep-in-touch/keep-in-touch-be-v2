// src/modules/messages/helpers/message-status.helper.ts
import { MessageStatus } from '@entities/message.entity';
import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { MessageStatusString, ReactionTypeKorean } from '../types/messages.type';

const MESSAGE_STATUS_MAPPING = {
  normal: MessageStatus.NORMAL,
  hidden: MessageStatus.HIDDEN,
  reported: MessageStatus.REPORTED,
} as const;

const REVERSE_STATUS_MAPPING = {
  [MessageStatus.NORMAL]: 'normal',
  [MessageStatus.HIDDEN]: 'hidden',
  [MessageStatus.REPORTED]: 'reported',
} as const;

export function toMessageStatusEnum(status: MessageStatusString): MessageStatus {
  return MESSAGE_STATUS_MAPPING[status];
}

export function toMessageStatusString(status: MessageStatus): MessageStatusString {
  return REVERSE_STATUS_MAPPING[status];
}

export function getReactionTypeKorean(type: ReactionTemplateType): ReactionTypeKorean {
  switch (type) {
    case ReactionTemplateType.THANKS:
      return '감사';
    case ReactionTemplateType.APOLOGY:
      return '사과';
    case ReactionTemplateType.CHEER_UP:
      return '응원';
    case ReactionTemplateType.RECONCILIATION:
      return '화해';
    default:
      throw new Error('Invalid reaction type');
  }
}
