import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmotionRepository, MessageRepository, QuestionRepository, UserRepository } from '@repositories/index';
import { CreateMessageDto, ResponseCreateMessageDto } from './dto/create-message.dto';
import { MessageBaseData } from './types/messages.type';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly emotionRepository: EmotionRepository,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<ResponseCreateMessageDto> {
    const { receiverId, content, questionId, emotionId } = createMessageDto;

    if ((questionId && emotionId) || (!questionId && !emotionId)) {
      throw new BadRequestException('질문 혹은 감정 중 하나의 id를 입력해주세요.');
    }
    const user = await this.userRepository.findUserById(receiverId);
    if (user === null) {
      throw new NotFoundException('받는 사람이 존재하지 않습니다.');
    }
    if (receiverId === userId) {
      throw new BadRequestException('자신에게 쪽지를 보낼 수 없습니다.');
    }

    const messageData = {
      senderId: userId,
      receiverId,
      content,
    };

    let messageId = '';
    if (questionId) {
      messageId = await this.createQuestionMessage(messageData, questionId);
    }
    if (emotionId) {
      messageId = await this.createEmotionMessage(messageData, emotionId);
    }

    return { messageId };
  }

  private async createQuestionMessage(messageData: MessageBaseData, questionId: string): Promise<string> {
    const question = await this.questionRepository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException(`질문이 존재하지 않습니다.: ${questionId}`);
    }
    if (question.userId !== messageData.receiverId) {
      throw new BadRequestException('질문의 수신자와 쪽지의 수신자가 일치하지 않습니다.');
    }

    return this.messageRepository.createQuestionMessage({ ...messageData, questionId });
  }

  private async createEmotionMessage(messageData: MessageBaseData, emotionId: string): Promise<string> {
    const emotion = await this.emotionRepository.findEmotionById(emotionId);
    if (!emotion) {
      throw new NotFoundException(`감정이 존재하지 않습니다.: ${emotionId}`);
    }

    return this.messageRepository.createEmotionMessage({ ...messageData, emotionId });
  }
}
