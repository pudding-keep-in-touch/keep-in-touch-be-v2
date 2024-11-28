import { BaseMessageDto } from './base-message.dto';

export class GetMyMessagesDto {
  sentMessageCount: number;
  nextCursor: Date | null;
  messageList: BaseMessageDto[];
}
