import { KakaoConfigService } from '@configs/kakao/kakao-config.service';
import { CustomLogger } from '@logger/custom-logger.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { KakaoIdTokenType } from '../types/id-token.type';
import { KakaoOIDCProvider } from './kakao-oidc.provider';

describe('KakaoOIDCProvider', () => {
  let provider: KakaoOIDCProvider;
  let jwtService: JwtService;
  let mockLogger: jest.Mocked<CustomLogger>;
  let mockKakaoConfig: Partial<KakaoConfigService>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockKakaoConfig = {
      clientId: 'kakao-client-id',
      callbackUrl: 'http://localhost:3000/auth/kakao/callback',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KakaoOIDCProvider,
        {
          provide: KakaoConfigService,
          useValue: mockKakaoConfig,
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

    provider = module.get<KakaoOIDCProvider>(KakaoOIDCProvider);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getUserProfile', () => {
    it('유효한 카카오 ID 토큰에서 사용자 프로필을 추출해야 한다', () => {
      const token: KakaoIdTokenType = {
        iss: 'https://kauth.kakao.com',
        sub: '12345',
        aud: 'kakao-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        auth_time: Math.floor(Date.now() / 1000),
        email: 'test@kakao.com',
        nickname: '테스트 유저',
      };

      const profile = (provider as any).getUserProfile(token);

      expect(profile).toEqual({
        id: '12345',
        email: 'test@kakao.com',
        nickname: '테스트 유저',
      });
    });

    it('이메일이 누락된 경우 오류를 발생시켜야 한다', () => {
      const token: KakaoIdTokenType = {
        iss: 'https://kauth.kakao.com',
        sub: '12345',
        aud: 'kakao-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        auth_time: Math.floor(Date.now() / 1000),
        nickname: '테스트 유저',
      };

      expect(() => (provider as any).getUserProfile(token)).toThrow('이메일이 인증되지 않은 카카오 계정입니다');
    });
  });

  describe('exchangeCodeForTokens integration', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('Kakao OAuth를 이용하여 얻은 id_token에서 유저 정보를 가져와야 한다.', async () => {
      const mockIdToken = jwtService.sign({
        iss: 'https://kauth.kakao.com',
        sub: '12345',
        aud: 'kakao-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        auth_time: Math.floor(Date.now() / 1000),
        email: 'test@kakao.com',
        nickname: '테스트 유저',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock-access-token',
            id_token: mockIdToken,
            refresh_token: 'mock-refresh-token',
            refresh_token_expires_in: 5184000,
          }),
      });

      const result = await provider.exchangeCodeForTokens('valid-code');

      expect(result).toEqual({
        id: '12345',
        email: 'test@kakao.com',
        nickname: '테스트 유저',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('https://kauth.kakao.com/oauth/token');
      expect(fetchCall[1].body).not.toContain('client_secret');
    });
  });

  describe('getLoginUrl', () => {
    it('카카오 로그인 URL을 올바르게 생성해야 한다', () => {
      const url = provider.getLoginUrl();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(url.startsWith('https://kauth.kakao.com/oauth/authorize')).toBeTruthy();
      expect(params.get('client_id')).toBe(mockKakaoConfig.clientId);
      expect(params.get('redirect_uri')).toBe(mockKakaoConfig.callbackUrl);
      expect(params.get('response_type')).toBe('code');
      expect(params.get('scope')).toBe('openid account_email profile_nickname');
    });
  });
});
