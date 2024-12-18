import { MessageStatus } from '@entities/message.entity';
import { MessageStatusString } from '../types/messages.type';

/**
 * 문자열 상태값을 MessageStatus enum으로 변환하기 위한 매핑
 * @example MESSAGE_STATUS_MAPPING['normal'] === MessageStatus.NORMAL
 */
const MESSAGE_STATUS_MAPPING = {
  normal: MessageStatus.NORMAL,
  hidden: MessageStatus.HIDDEN,
  reported: MessageStatus.REPORTED,
} as const;

/**
 * MessageStatus enum을 문자열 상태값으로 변환하기 위한 매핑
 * @example REVERSE_STATUS_MAPPING[MessageStatus.NORMAL] === 'normal'
 */
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
