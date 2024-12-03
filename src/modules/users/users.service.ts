import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { GoogleUser } from '@common/types/google-user.type';
import { User } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

import { getOrderUpperCase } from '@common/helpers/pagination-option.helper';
import { PaginationOption } from '@common/types/pagination-option.type';
import { Message } from '@entities/message.entity';
//import { MessageStatisticRepository } from '@repositories/message-statistic.repository';
import { MessageRepository } from '@repositories/message.repository';
import { QuestionRepository } from '@repositories/question.repository';
import {
  GetMyMessagesQuery,
  GetMyMessagesResponseDto,
  GetMyReceivedMessagedDto,
  GetMySentMessagesDto,
} from './dto/get-my-messages.dto';
import { ResponseGetMyQuestionsDto } from './dto/get-my-questions.dto';
import { ResponseGetUserNicknameDto } from './dto/get-user-nickname.dto';
import { LoginType } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly messageRepository: MessageRepository,
    //private readonly messageStatisticRepository: MessageStatisticRepository,
  ) {}

  /**
   * 구글 사용자 로그인 혹은 회원가입
   *
   * @param googleUser
   * @returns
   */
  async createOrGetGoogleUser(googleUser: GoogleUser): Promise<{ userId: string; email: string }> {
    const user = await this.getUserByEmail(googleUser.email);

    if (user !== null) {
      if (user.loginType !== LoginType.GOOGLE) {
        throw new ConflictException('이미 다른 로그인 방식으로 가입된 이메일입니다.');
      }
      return { userId: user.userId, email: user.email };
    }
    const nickname = googleUser.displayName || this.generateNickname();

    const userId = await this.userRepository.createUser(googleUser.email, nickname, LoginType.GOOGLE);
    return { userId, email: googleUser.email };
  }

  /**
   * user 본인이 작성한 질문 조회
   *
   * @param userId
   * @returns ResponseGetMyQuestionsDto: questionId, content, isHidden, createdAt의 배열
   */
  async getMyQuestions(userId: string): Promise<ResponseGetMyQuestionsDto> {
    const questions = await this.questionRepository.findQuestionsByUserId(userId);
    return questions;
  }

  async getMyMessages(userId: string, query: GetMyMessagesQuery): Promise<GetMyMessagesResponseDto> {
    const { type } = query;
    const paginationOptions: PaginationOption = {
      cursor: query.cursor,
      limit: query.limit,
      order: getOrderUpperCase(query.order),
    };

    const messages = await this.messageRepository.findMessagesByUserId(userId, type, paginationOptions);

    if (type === 'sent') {
      const meta = await this.getSentMetaData(userId, messages);
      return GetMySentMessagesDto.from(messages, meta);
    }

    const meta = await this.getReceivedMetaData(userId, messages);
    return GetMyReceivedMessagedDto.from(messages, meta);
  }

  /**
   * id 기준으로 사용자 닉네임 조회
   *
   * @param userId
   * @returns
   */
  async getNicknameById(userId: string): Promise<ResponseGetUserNicknameDto> {
    const user = await this.userRepository.findUserById(userId);
    if (user === null) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return { userId: user.userId, nickname: user.nickname };
  }

  /**
   * email 기준으로 사용자 조회
   *
   * @param email (unique)
   * @returns
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(email);
  }

  /**
   * id 기준으로 사용자 조회
   *
   * @param id
   * @returns
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }

  private generateNickname(): string {
    const minNumber = 1000;
    const maxNumber = 9999;
    const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    return `퐁${randomNumber}`;
  }

  private async getSentMetaData(userId: string, messages: Message[]) {
    //// TODO: reaction info get
    //const { sentMessageCount } = await this.messageStatisticRepository.findOneOrFail({
    //  select: ['sentMessageCount'],
    //  where: { userId: userId },
    //});

    const sentMessageCount = await this.messageRepository.countBy({ senderId: userId });
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null;
    return { sentMessageCount, nextCursor };
  }

  private async getReceivedMetaData(userId: string, messages: Message[]) {
    // NOTE: message 테이블을 가져와 세는 방식으로 변경.
    const allMessage = await this.messageRepository.find({
      select: ['readAt', 'messageId'], // NOTE: readAt만 select하면 typeorm이 null인 값은 거른다... (대체왜ㅠㅠ)
      where: { receiverId: userId },
    });
    const receivedMessageCount = allMessage.length;
    const unreadMessageCount = allMessage.filter((message) => message.readAt === null).length;

    //const { receivedMessageCount, unreadMessageCount } = await this.messageStatisticRepository.findOneOrFail({
    //  select: ['receivedMessageCount', 'unreadMessageCount'],
    //  where: { userId: userId },
    //});
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null;
    return { receivedMessageCount, unreadMessageCount, nextCursor };
  }
}
