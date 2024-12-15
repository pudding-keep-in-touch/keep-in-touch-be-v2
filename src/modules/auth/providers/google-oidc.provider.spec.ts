import { GoogleConfigService } from '@configs/google/google-config.service';
import { CustomLogger } from '@logger/custom-logger.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleIdTokenType } from '../types/id-token.type';
import { GoogleOIDCProvider } from './google-oidc.provider';

describe('GoogleOIDCProvider', () => {
  let provider: GoogleOIDCProvider;
  let jwtService: JwtService;
  let mockLogger: jest.Mocked<CustomLogger>;
  let mockGoogleConfig: Partial<GoogleConfigService>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockGoogleConfig = {
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
      callbackUrl: 'http://localhost:3000/auth/google/callback',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOIDCProvider,
        {
          provide: GoogleConfigService,
          useValue: mockGoogleConfig,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'test-secret',
          }),
        },
      ],
    }).compile();

    provider = module.get<GoogleOIDCProvider>(GoogleOIDCProvider);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getUserProfile', () => {
    it('유효한 Google ID 토큰에서 user profile을 추출해야 한다', () => {
      const token: GoogleIdTokenType = {
        iss: 'https://accounts.google.com',
        sub: '12345',
        aud: 'google-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        email: 'test@gmail.com',
        name: 'Test User',
        email_verified: true,
      };

      const profile = (provider as any).getUserProfile(token);

      expect(profile).toEqual({
        id: '12345',
        email: 'test@gmail.com',
        nickname: 'Test User',
      });
    });

    it('email 이 없으면 error', () => {
      const token: GoogleIdTokenType = {
        iss: 'https://accounts.google.com',
        sub: '12345',
        aud: 'google-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        name: 'Test User',
      };

      expect(() => (provider as any).getUserProfile(token)).toThrow('Email is required');
    });
  });

  describe('exchangeCodeForTokens integration', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('Google OAuth를 이용하여 얻은 id_token에서 유저 정보를 가져와야 한다.', async () => {
      const mockIdToken = jwtService.sign({
        iss: 'https://accounts.google.com',
        sub: '12345',
        aud: 'google-client-id',
        email: 'test@gmail.com',
        name: 'Test User',
        email_verified: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      // id token 제공
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock-access-token',
            id_token: mockIdToken,
            refresh_token: 'mock-refresh-token',
          }),
      });

      // id, email, nickname형태로 변환
      const result = await provider.exchangeCodeForTokens('valid-code');

      expect(result).toEqual({
        id: '12345',
        email: 'test@gmail.com',
        nickname: 'Test User',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('https://oauth2.googleapis.com/token');
      expect(fetchCall[1].body).toContain('client_secret=' + mockGoogleConfig.clientSecret);
    });
  });

  describe('getLoginUrl', () => {
    it('구글 로그인 URL을 올바르게 생성해야 한다.', () => {
      const url = provider.getLoginUrl();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(url.startsWith('https://accounts.google.com/o/oauth2/v2/auth')).toBeTruthy();
      expect(params.get('client_id')).toBe(mockGoogleConfig.clientId);
      expect(params.get('redirect_uri')).toBe(mockGoogleConfig.callbackUrl);
      expect(params.get('response_type')).toBe('code');
      expect(params.get('scope')).toBe('openid email profile');
    });
  });
});
