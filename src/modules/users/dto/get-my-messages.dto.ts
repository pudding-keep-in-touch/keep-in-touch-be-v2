import { Message } from '@entities/message.entity';
import { toMessageStatusString } from '@modules/messages/helpers/message-reaction.helper';
import { MessageOrder, MessageStatusString, MessageType } from '@modules/messages/types/messages.type';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, Max, Min } from 'class-validator';
import { BaseMessageDto } from '../../messages/dto/base-message.dto';

/**
 * type	받은 쪽지, 보낸 쪽지 구분 (received/sent)
 * cursor(datetime)	가장 최근 일자 (datetime)
 * limit	가져올 쪽지 개수 (default: 10)
 * order	정렬 (desc/asc), (default: desc)
 */
export class GetMyMessagesQuery {
  @ApiProperty({
    description: '받은 쪽지, 보낸 쪽지 구분 (received/sent)',
    example: 'received',
    enum: ['received', 'sent'],
  })
  @IsIn(['received', 'sent'])
  type: MessageType; // received/sent

  // IsDate?
  @ApiProperty({
    description: '가져올 가장 최근 메세지의 일자 (default: 현재 시점 datetime)',
    required: false,
    example: '2024-11-29T16:03:19.378Z',
  })
  @IsOptional()
  @IsDateString()
  cursor?: Date;

  @ApiProperty({
    description: '가져올 쪽지 개수 (default: 3)',
    required: false,
    example: 3,
  })
  @IsOptional()
  @Min(1)
  @Max(30)
  @Type(() => Number) // number로 변환해주어야 최대, 최소값 검사 가능
  limit: number = 3;

  @ApiProperty({
    description: '정렬 (desc/asc), (default: desc)',
    required: false,
    example: 'desc',
    default: 'desc',
    enum: ['desc', 'asc'],
  })
  @IsOptional()
  @IsIn(['desc', 'asc'])
  order: MessageOrder = 'desc';
}

// message type
export class ReceivedMessageDto extends BaseMessageDto {
  @ApiProperty({
    description: '메세지 상태: 정상, 숨김처리, 신고됨',
    example: 'normal',
  })
  status: MessageStatusString;

  @ApiProperty({
    description: '내가 읽은 메세지 날짜',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2024-11-29T16:03:19.378Z',
  })
  readAt: Date | null; // 메세지 (내가) 읽은 날짜

  static from(message: Message): ReceivedMessageDto {
    return {
      messageId: message.messageId,
      receiverId: message.receiver.userId,
      receiverNickname: message.receiver.nickname,
      content: message.content,
      createdAt: message.createdAt,
      status: toMessageStatusString(message.status),
      readAt: message.readAt,
    };
  }
}

export class SentMessageDto extends BaseMessageDto {
  @ApiProperty({
    description: 'reaction 생성 날짜, 읽음 날짜. reaction이 없을 경우 null',
    type: 'object',
    nullable: true,
    properties: {
      createdAt: { type: 'string', format: 'date-time', nullable: true },
      readAt: { type: 'string', format: 'date-time', nullable: true },
    },
  })
  reactionInfo: {
    createdAt: Date | null;
    readAt: Date | null;
  } | null;

  static from(message: Message): SentMessageDto {
    return {
      messageId: message.messageId,
      receiverId: message.receiver.userId,
      receiverNickname: message.receiver.nickname,
      content: message.content,
      createdAt: message.createdAt,
      reactionInfo: message.reactionInfo && {
        createdAt: message.reactionInfo.createdAt,
        readAt: message.reactionInfo.readAt,
      },
    };
  }
}

export class GetMySentMessagesDto {
  @ApiProperty({
    description: '유저가 보낸 총 메세지 개수',
    example: 30,
  })
  sentMessageCount: number;

  @ApiProperty({
    description: '다음 페이지 cursor, 없을 경우 null',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2024-11-29T16:03:19.378Z',
  })
  nextCursor: Date | null;

  @ApiProperty({
    description: '유저가 보낸 메세지 리스트',
    type: [SentMessageDto],
  })
  messageList: SentMessageDto[];

  static from(messages: Message[], meta: { sentMessageCount: number; nextCursor: Date | null }) {
    return {
      sentMessageCount: meta.sentMessageCount,
      nextCursor: meta.nextCursor,
      messageList: messages.map(SentMessageDto.from),
    };
  }
}

export class GetMyReceivedMessagedDto {
  @ApiProperty({
    description: '유저가 받은 총 메세지 개수',
    example: 30,
  })
  receivedMessageCount: number;

  @ApiProperty({
    description: '유저가 받은 읽지 않은 메세지 개수',
    example: 3,
  })
  unreadMessageCount: number;

  @ApiProperty({
    description: '다음 페이지 cursor, 없을 경우 null',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2024-11-29T16:03:19.378Z',
  })
  nextCursor: Date | null;
  messageList: ReceivedMessageDto[];

  static from(
    messages: Message[],
    meta: { receivedMessageCount: number; unreadMessageCount: number; nextCursor: Date | null },
  ) {
    return {
      receivedMessageCount: meta.receivedMessageCount,
      unreadMessageCount: meta.unreadMessageCount,
      nextCursor: meta.nextCursor,
      messageList: messages.map(ReceivedMessageDto.from),
    };
  }
}

export type ResponseGetMyMessagesDto = GetMyReceivedMessagedDto | GetMySentMessagesDto;
