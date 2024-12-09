import { Message } from '@entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';
import { getReactionTypeKorean, toMessageStatusString } from '../helpers/message-reaction.helper';
import { MessageStatusString, MessageType } from '../types/messages.type';
import { BaseMessageDto } from './base-message.dto';

/**
 * @brief 쪽지 상세 조회 DTO
 */
abstract class MessageDetailDto extends BaseMessageDto {
  @ApiProperty({
    description: '쪽지 타입 (sent: 보낸 쪽지, received: 받은 쪽지)',
    example: 'received',
  })
  type: MessageType;

  @ApiProperty({
    description: '쪽지에 대한 보내진 질문 정보',
    required: false,
    example: { questionId: '1', content: '너의 장점은 솔직하다는 거야.' },
  })
  question?: {
    questionId: string;
    content: string;
  };

  //@ApiProperty({
  //  description: '쪽지에 대한 감정 정보',
  //  required: false,
  //})
  emotion?: {
    emotionId: string;
    name: string;
    emoji: string;
  };

  @ApiProperty({
    description: '쪽지에 대한 반응 정보',
    required: false,
    example: [
      {
        reactionId: '1',
        content: '고마워',
        type: '감사',
        emoji: '😊',
      },
    ],
  })
  reactions: {
    reactionId: string;
    content: string;
    type: string; // 한글 변환
    emoji: string;
  }[];

  static baseFrom(message: Message): Omit<MessageDetailDto, 'type'> {
    const { messageId, receiver, content, question, emotion, reactions, createdAt } = message;
    return {
      messageId,
      receiverId: receiver.userId,
      receiverNickname: receiver.nickname,
      content,
      emotion: emotion ? { emotionId: String(emotion.emotionId), name: emotion.name, emoji: emotion.emoji } : undefined,
      question: question ? { questionId: question.questionId, content: question.content } : undefined,
      reactions: reactions.map((reaction) => ({
        reactionId: reaction.reactionId,
        content: reaction.reactionTemplate.content,
        type: getReactionTypeKorean(reaction.reactionTemplate.type),
        emoji: reaction.reactionTemplate.emoji,
      })),
      createdAt,
    };
  }
}

export class ReceivedMessageDetailDto extends MessageDetailDto {
  @ApiProperty({
    description: '쪽지 처리 상태 (normal: 일반, hidden: 숨김, reported: 신고)',
    example: 'normal',
  })
  status: MessageStatusString;

  static from(message: Message): ReceivedMessageDetailDto {
    const base = MessageDetailDto.baseFrom(message);
    const status = toMessageStatusString(message.status);
    return {
      ...base,
      type: 'received',
      status,
    };
  }
}

export class SentMessageDetailDto extends MessageDetailDto {
  static from(message: Message): SentMessageDetailDto {
    const base = MessageDetailDto.baseFrom(message);
    return {
      ...base,
      type: 'sent',
    };
  }
}
