import { UsersService } from '@modules/users/users.service';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleUser } from '../../common/types/google-user.type';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createOrUpdateGoogleUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testAccessToken'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'testSecret';
              if (key === 'JWT_EXPIRES_IN') return '1h';
              return '';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('googleLogin', () => {
    it('access token과 user id를 리턴해야 한다.', async () => {
      const mockGoogleUser = {
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUserInput = {
        userId: 1,
        email: 'test@gmail.com',
      };

      jest.spyOn(usersService, 'createOrUpdateGoogleUser').mockResolvedValue(mockUserInput);

      const result = await service.googleLogin(mockGoogleUser);

      expect(usersService.createOrUpdateGoogleUser).toHaveBeenCalledWith(mockGoogleUser);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@gmail.com', sub: 1 },
        { secret: 'testSecret', expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'testAccessToken', userId: 1 });
    });
  });
});
