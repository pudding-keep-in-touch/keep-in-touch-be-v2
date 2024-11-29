// src/modules/messages/helpers/message-status.helper.ts
import { MessageStatus } from '@entities/message.entity';
import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { MessageStatusString } from '../types/messages.type';

export function getMessageStatusString(status: MessageStatus): MessageStatusString {
  return MessageStatus[status].toLowerCase() as MessageStatusString;
}

export function getReactionTypeKorean(type: ReactionTemplateType) {
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
