import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GoogleUser } from '@common/types/google-user.type';
import { User } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

import { Question } from '@entities/question.entity';
import { QuestionRepository } from '@repositories/question.repository';
import { LoginType } from './users.constants';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let questionRepository: QuestionRepository;

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
          },
        },
        {
          provide: QuestionRepository,
          useValue: {
            findQuestionsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
  });

  describe('createOrGetGoogleUser', () => {
    it('새 구글 유저 생성', async () => {
      const googleUser: GoogleUser = {
        email: 'test@example.com',
        displayName: 'John Doe',
      };

      jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'insert')
        .mockResolvedValue({ identifiers: [{ id: '1' }], generatedMaps: [], raw: [] });
      jest.spyOn(userRepository, 'createUser').mockResolvedValue('1');

      const result = await service.createOrGetGoogleUser(googleUser);

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.createUser).toHaveBeenCalledWith('test@example.com', 'John Doe', LoginType.GOOGLE);
      expect(result).toEqual({ userId: '1', email: 'test@example.com' });
    });

    it('다른 로그인 방식으로 가입된 사용자면 Conflict exception', async () => {
      const googleUser: GoogleUser = {
        email: 'test@example.com',
        displayName: 'John Doe',
      };

      const existingUser: User = {
        userId: '1',
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.KAKAO,
      } as User;

      jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(existingUser);

      await expect(service.createOrGetGoogleUser(googleUser)).rejects.toThrow(ConflictException);
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

  describe('getUserByEmail', () => {
    it('email로 유저 조회', async () => {
      const email = 'test@example.com';
      const user: User = {
        userId: '1',
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(user);

      const result = await service.getUserByEmail(email);

      expect(result).toEqual(user);
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('유저가 없으면 null 반환', async () => {
      const email = 'test@example.com';

      jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null);
      const result = await service.getUserByEmail(email);

      expect(result).toBeNull();
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
});
