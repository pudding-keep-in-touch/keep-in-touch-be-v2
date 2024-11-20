import { GoogleUser } from '@common/types/google-user.type';
import { User } from '@entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginType } from './users.constants';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            getUserByEmail: jest.fn(),
            insert: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('createOrGetGoogleUser', () => {
    it('새 구글 유저 생성', async () => {
      const googleUser: GoogleUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(repository, 'getUserByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'insert').mockResolvedValue({ identifiers: [{ id: 1 }], generatedMaps: [], raw: [] });

      const result = await service.createOrGetGoogleUser(googleUser);

      expect(result).toEqual({ userId: 1, email: 'test@example.com' });
      expect(repository.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(repository.insert).toHaveBeenCalledWith({
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      });
    });

    it('다른 로그인 방식으로 가입된 사용자면 Conflict exception', async () => {
      const googleUser: GoogleUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser: User = {
        userId: 1,
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.KAKAO,
      } as User;

      jest.spyOn(repository, 'getUserByEmail').mockResolvedValue(existingUser);

      await expect(service.createOrGetGoogleUser(googleUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('getNicknameById', () => {
    it('유저 닉네임 조회', async () => {
      const userId = 1;
      const user: User = {
        userId: 1,
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(repository, 'getUserById').mockResolvedValue(user);

      const result = await service.getNicknameById(userId);

      expect(result).toEqual({ userId: 1, nickname: 'John Doe' });
      expect(repository.getUserById).toHaveBeenCalledWith(userId);
    });

    it('user id가 없으면 Not Found exception', async () => {
      const userId = 1;

      jest.spyOn(repository, 'getUserById').mockResolvedValue(null);

      await expect(service.getNicknameById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByEmail', () => {
    it('email로 유저 조회', async () => {
      const email = 'test@example.com';
      const user: User = {
        userId: 1,
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(repository, 'getUserByEmail').mockResolvedValue(user);

      const result = await service.getUserByEmail(email);

      expect(result).toEqual(user);
      expect(repository.getUserByEmail).toHaveBeenCalledWith(email);
    });

    it('유저가 없으면 null 반환', async () => {
      const email = 'test@example.com';

      jest.spyOn(repository, 'getUserByEmail').mockResolvedValue(null);
      const result = await service.getUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('id로 유저 조회', async () => {
      const userId = 1;
      const user: User = {
        userId: 1,
        email: 'test@example.com',
        nickname: 'John Doe',
        loginType: LoginType.GOOGLE,
      } as User;

      jest.spyOn(repository, 'getUserById').mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
      expect(repository.getUserById).toHaveBeenCalledWith(userId);
    });

    it('유저가 없으면 null 반환', async () => {
      const userId = 1;

      jest.spyOn(repository, 'getUserById').mockResolvedValue(null);
      const result = await service.getUserById(userId);

      expect(result).toBeNull();
    });
  });
});
