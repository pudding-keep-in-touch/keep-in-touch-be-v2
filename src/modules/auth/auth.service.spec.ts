import { UsersService } from '@modules/users/users.service';

import { JwtConfigService } from '@configs/jwt/jwt-config.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let jwtConfigService: JwtConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createOrGetGoogleUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testAccessToken'),
          },
        },
        {
          provide: JwtConfigService,
          useValue: {
            secret: 'testSecret',
            expiresIn: '1h',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jwtConfigService = module.get<JwtConfigService>(JwtConfigService);
  });

  describe('googleLogin', () => {
    it('access token과 user id를 리턴해야 한다.', async () => {
      const mockGoogleUser = {
        sub: '11234',
        email: 'test@gmail.com',
        nickname: 'test',
      };

      const userInfo = {
        userId: '1',
        email: 'test@gmail.com',
      };

      jest.spyOn(usersService, 'createOrGetGoogleUser').mockResolvedValue(userInfo);

      const result = await service.googleLogin(mockGoogleUser);

      expect(usersService.createOrGetGoogleUser).toHaveBeenCalledWith(mockGoogleUser);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@gmail.com', sub: '1' },
        { secret: 'testSecret', expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'testAccessToken', userId: '1' });
    });
  });
});
