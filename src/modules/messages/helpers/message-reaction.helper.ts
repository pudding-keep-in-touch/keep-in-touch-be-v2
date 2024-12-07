// src/modules/messages/helpers/message-status.helper.ts
import { MessageStatus } from '@entities/message.entity';
import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { MessageStatusString, ReactionTypeKorean } from '../types/messages.type';

export function getMessageStatusString(status: MessageStatus): MessageStatusString {
  switch (status) {
    case MessageStatus.NORMAL:
      return 'normal';
    case MessageStatus.HIDDEN:
      return 'hidden';
    case MessageStatus.REPORTED:
      return 'reported';
    default:
      throw new Error(`Invalid message status: ${status}`);
  }
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
