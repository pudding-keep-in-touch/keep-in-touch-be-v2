import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmotionRepository, MessageRepository, QuestionRepository, UserRepository } from '@repositories/index';
import { CreateMessageDto, ResponseCreateMessageDto } from './dto/create-message.dto';
import { ReceivedMessageDetailDto, SentMessageDetailDto } from './dto/message-detail.dto';
import { MessageBaseData, MessageDetailParam } from './types/messages.type';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly emotionRepository: EmotionRepository,
  ) {}

  /**
   * emotionId가 있을 경우 감정 쪽지를 생성하고, questionId가 있을 경우 질문 쪽지를 생성합니다.
   *
   * @param createMessageDto receiverId, content, questionId, emotionId를 포함하는 DTO
   * @param userId 보내는 사람 (로그인한 유저) id
   * @returns 생성된 쪽지 id
   */
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

  /**
   * 메세지 상세 정보를 조회합니다.
   *
   * @param MessageDetailParam messageId, userId를 포함하는 parameter
   * @returns 받은 쪽지인 경우 ReceivedMessageDetailDto, 보낸 쪽지인 경우 SentMessageDetailDto
   */
  async getMessageDetail({
    userId,
    messageId,
  }: MessageDetailParam): Promise<SentMessageDetailDto | ReceivedMessageDetailDto> {
    const message = await this.messageRepository.findMessageDetailById(messageId, userId);

    if (!message) {
      throw new NotFoundException('쪽지가 존재하지 않습니다.');
    }
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('쪽지를 볼 권한이 없습니다.');
    }

    // DTO 변환
    if (message.senderId === userId) {
      return SentMessageDetailDto.from(message);
    }
    return ReceivedMessageDetailDto.from(message);
  }

  /**
   * question 에 대한 쪽지를 생성합니다.
   *
   * @param messageData
   * @param questionId
   * @returns 생성된 쪽지 id
   */
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

  /**
   * question 에 속하지 않는 자유 쪽지를 생성합니다.
   * emotion 1 : 응원과 감사, 2: 솔직한 대화.
   *
   * @param messageData \
   * @param emotionId
   * @returns
   */
  private async createEmotionMessage(messageData: MessageBaseData, emotionId: string): Promise<string> {
    const emotion = await this.emotionRepository.findEmotionById(emotionId);
    if (!emotion) {
      throw new NotFoundException(`감정이 존재하지 않습니다.: ${emotionId}`);
    }

    return this.messageRepository.createEmotionMessage({ ...messageData, emotionId });
  }
}
