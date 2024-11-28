import { Message } from '@entities/message.entity';
import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { ApiProperty } from '@nestjs/swagger';
import { getMessageStatusString } from '../helpers/message-status.helper';
import { MessageType } from '../types/messages.type';
import { BaseMessageDto } from './base-message.dto';

/**
 * @brief 쪽지 상세 조회 DTO
 */
class MessageDetailDto extends BaseMessageDto {
  @ApiProperty({ enum: ['received', 'sent'] })
  type: MessageType;
  question?: {
    questionId: string;
    content: string;
  };
  emotion?: {
    emotionId: string;
    name: string;
    emoji: string;
  };
  reactions: {
    reactionId: string;
    content: string;
    type: ReactionTemplateType; // 1, 2
    emoji: string;
  }[];
}

export class ReceivedMessageDetailDto extends MessageDetailDto {
  status: 'normal' | 'hidden' | 'reported';

  static from(message: Message): ReceivedMessageDetailDto {
    const { messageId, receiver, content, question, emotion, reactions, status, createdAt } = message;
    return {
      messageId,
      type: 'received',
      receiverId: receiver.userId,
      receiverNickname: receiver.nickname,
      content,
      emotion: emotion ? { emotionId: String(emotion.emotionId), name: emotion.name, emoji: emotion.emoji } : undefined,
      question: question ? { questionId: question.questionId, content: question.content } : undefined,
      reactions: reactions.map((reaction) => ({
        reactionId: reaction.reactionId,
        content: reaction.reactionTemplate.content,
        type: reaction.reactionTemplate.type,
        emoji: reaction.reactionTemplate.emoji,
      })),
      status: getMessageStatusString(status),
      createdAt,
    };
  }
}

export class SentMessageDetailDto extends MessageDetailDto {
  static from(message: Message): SentMessageDetailDto {
    const { messageId, receiver, content, question, emotion, reactions, createdAt } = message;
    return {
      messageId,
      type: 'sent',
      receiverId: receiver.userId,
      receiverNickname: receiver.nickname,
      content,
      emotion: emotion ? { emotionId: String(emotion.emotionId), name: emotion.name, emoji: emotion.emoji } : undefined,
      question: question ? { questionId: question.questionId, content: question.content } : undefined,
      reactions: reactions.map((reaction) => ({
        reactionId: reaction.reactionId,
        content: reaction.reactionTemplate.content,
        type: reaction.reactionTemplate.type,
        emoji: reaction.reactionTemplate.emoji,
      })),
      createdAt,
    };
  }
}
