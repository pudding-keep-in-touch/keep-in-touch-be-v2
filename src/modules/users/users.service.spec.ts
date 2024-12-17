import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { LoginType, User } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

import { MessageStatus } from '@entities/message.entity';
import { Question } from '@entities/question.entity';
import { SocialUserProfile } from '@modules/auth/types/user-profile.type';
import { MessageStatisticRepository } from '@repositories/message-statistic.repository';
import { MessageRepository } from '@repositories/message.repository';
import { QuestionRepository } from '@repositories/question.repository';
import { GetMyMessagesQuery, GetMyReceivedMessagedDto, GetMySentMessagesDto } from './dto/get-my-messages.dto';
import { UsersService } from './users.service';

export const createMockMessage = (overrides = {}) => ({
  messageId: '1',
  content: '메시지 내용',
  status: MessageStatus.NORMAL,
  receiver: {
    userId: '2',
    nickname: 'Alice',
  },
  sender: {
    userId: '1',
    nickname: 'Bob',
  },
  createdAt: new Date(),
  readAt: new Date(),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let questionRepository: QuestionRepository;
  let messageRepository: MessageRepository;
  let messageStatisticRepository: MessageStatisticRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findUserByEmail: jest.fn(),
            insert: jest.fn(),
            findUserById: jest.fn(),
            createUser: jest.fn(),
            findUserByEmailWithLoginType: jest.fn(),
          },
        },
        {
          provide: QuestionRepository,
          useValue: {
            findQuestionsByUserId: jest.fn(),
          },
        },
        {
          provide: MessageRepository,
          useValue: {
            findMessagesByUserId: jest.fn(),
            countBy: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: MessageStatisticRepository,
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
    messageRepository = module.get<MessageRepository>(MessageRepository);
    messageStatisticRepository = module.get<MessageStatisticRepository>(MessageStatisticRepository);
  });

  describe('createOrGetGoogleUser', () => {
    it('새 구글 유저 생성', async () => {
      const googleUser: SocialUserProfile = {
        sub: '1234',
        email: 'test@example.com',
        nickname: 'John Doe',
      };

      jest.spyOn(userRepository, 'findUserByEmailWithLoginType').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'insert')
        .mockResolvedValue({ identifiers: [{ id: '1' }], generatedMaps: [], raw: [] });
      jest.spyOn(userRepository, 'createUser').mockResolvedValue('1');

      const result = await service.createOrGetGoogleUser(googleUser);

      expect(userRepository.findUserByEmailWithLoginType).toHaveBeenCalledWith('test@example.com', LoginType.GOOGLE);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email: googleUser.email,
        nickname: googleUser.nickname,
        loginType: LoginType.GOOGLE,
      });
      expect(result).toEqual({ userId: '1', email: 'test@example.com' });
    });
  });

  describe('createOrGetKakaoUser', () => {
    it('새 카카오 유저 생성', async () => {
      const kakaoUser: SocialUserProfile = {
        sub: '1234',
        email: 'test@example.com',
        nickname: 'John Doe',
      };

      jest.spyOn(userRepository, 'findUserByEmailWithLoginType').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'insert')
        .mockResolvedValue({ identifiers: [{ id: '1' }], generatedMaps: [], raw: [] });

      jest.spyOn(userRepository, 'createUser').mockResolvedValue('1');

      const result = await service.createOrGetKakaoUser(kakaoUser);

      expect(userRepository.findUserByEmailWithLoginType).toHaveBeenCalledWith('test@example.com', LoginType.KAKAO);
    });

    it('이미 존재하는 카카오 유저 조회', async () => {
      const kakaoUser: SocialUserProfile = {
        sub: '1234',
        email: 'test@example.com',
        nickname: 'John Doe',
      };

      jest.spyOn(userRepository, 'findUserByEmailWithLoginType').mockResolvedValue({
        userId: '1',
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.KAKAO,
      } as any);

      const result = await service.createOrGetKakaoUser(kakaoUser);
      expect(result).toEqual({ userId: '1', email: 'test@example.com' });
      expect(userRepository.createUser).not.toHaveBeenCalled();

      /**
       * 이미 존재하는 유저 처리
       * 이메일이 없는 카카오 계정 처리
       * 닉네임 중복 처리
       */
    });
  });

  describe('getNicknameById', () => {
    it('유저 닉네임 조회', async () => {
      const userId = '1';
      const user: User = {
        userId: '1',
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(userRepository, 'findUserById').mockResolvedValue(user);

      const result = await service.getNicknameById(userId);

      expect(result).toEqual({ userId: '1', nickname: 'John Doe' });
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('user id가 없으면 Not Found exception', async () => {
      const userId = '1';

      jest.spyOn(userRepository, 'findUserById').mockResolvedValue(null);

      await expect(service.getNicknameById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserById', () => {
    it('id로 유저 조회', async () => {
      const userId = '1';
      const user: User = {
        userId: '1',
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(userRepository, 'findUserById').mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('유저가 없으면 null 반환', async () => {
      const userId = '1';

      jest.spyOn(userRepository, 'findUserById').mockResolvedValue(null);
      const result = await service.getUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('getMyQuestions', () => {
    it('유저가 작성한 질문 조회', async () => {
      const userId = '1';
      const questions = [
        {
          questionId: '1',
          content: '질문 내용',
          isHidden: false,
          createdAt: new Date(),
        },
        {
          questionId: '2',
          content: '질문 내용2',
          isHidden: false,
          createdAt: new Date(),
        },
        {
          questionId: '3',
          content: '질문 내용3',
          isHidden: false,
          createdAt: new Date(),
        },
      ] as Question[];

      jest.spyOn(questionRepository, 'findQuestionsByUserId').mockResolvedValue(questions);

      const result = await service.getMyQuestions(userId);

      expect(result).toEqual(questions);
      expect(questionRepository.findQuestionsByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getMyMessages', () => {
    it('유저가 보낸 메시지 조회', async () => {
      const userId = '1';
      const query: GetMyMessagesQuery = {
        type: 'sent',
        limit: 10,
        order: 'asc',
      };
      const messages = [
        createMockMessage({
          messageId: '1',
          reactionInfo: null,
        }),
        createMockMessage({
          messageId: '2',
          reactionInfo: {
            createdAt: new Date(),
            readAt: new Date(),
          },
        }),
      ] as any;

      jest.spyOn(messageRepository, 'findMessagesByUserId').mockResolvedValue(messages);
      jest.spyOn(messageStatisticRepository, 'findOneOrFail').mockResolvedValue({
        sentMessageCount: 2,
      } as any);
      jest.spyOn(messageRepository, 'countBy').mockResolvedValue(2);

      const result = await service.getMyMessages(userId, query);

      expect(messageRepository.findMessagesByUserId).toHaveBeenCalledWith(userId, 'sent', {
        limit: 10,
        order: 'ASC',
      });

      expect(result).toEqual(
        GetMySentMessagesDto.from(messages, {
          sentMessageCount: 2,
          nextCursor: null,
        }),
      );
    });

    it('유저가 받은 메시지 조회', async () => {
      const userId = '1';
      const query: GetMyMessagesQuery = {
        type: 'received',
        limit: 10,
        order: 'asc',
      };
      const messages = [
        createMockMessage({ messageId: '1' }),
        createMockMessage({ messageId: '2', status: MessageStatus.HIDDEN, readAt: new Date() }),
      ];

      jest.spyOn(messageRepository, 'findMessagesByUserId').mockResolvedValue(messages as any);
      jest.spyOn(messageStatisticRepository, 'findOneOrFail').mockResolvedValue({
        receivedMessageCount: 2,
        unreadMessageCount: 1,
      } as any);
      jest.spyOn(messageRepository, 'find').mockResolvedValue([
        {
          readAt: new Date(),
        },
        { readAt: null },
      ] as any);
      const result = await service.getMyMessages(userId, query);

      expect(messageRepository.findMessagesByUserId).toHaveBeenCalledWith(userId, 'received', {
        limit: 10,
        order: 'ASC',
      });

      expect(result).toEqual(
        GetMyReceivedMessagedDto.from(messages as any, {
          receivedMessageCount: 2,
          unreadMessageCount: 1,
          nextCursor: null,
        }),
      );
    });
  });
});
