// src/modules/messages/helpers/message-status.helper.ts
import { MessageStatus } from '@entities/message.entity';
import { MessageStatusString } from '../types/messages.type';

export function getMessageStatusString(status: MessageStatus): MessageStatusString {
  return MessageStatus[status].toLowerCase() as MessageStatusString;
}
