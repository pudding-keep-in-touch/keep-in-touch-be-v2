import { CustomLogger } from '@logger/custom-logger.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IdTokenType } from '../types/id-token.type';
import { OIDCConfig } from '../types/oidc.type';
import { BaseOIDCProvider } from './base-oidc.provider';

// 테스트용 구현체
class TestOIDCProvider extends BaseOIDCProvider {
  protected getUserProfile(decodedIdToken: IdTokenType) {
    return {
      sub: decodedIdToken.sub,
      email: 'test@example.com',
      nickname: 'Test User',
    };
  }
}

describe('BaseOIDCProvider', () => {
  let provider: TestOIDCProvider;
  let jwtService: JwtService;
  let mockLogger: jest.Mocked<CustomLogger>;

  const mockConfig: OIDCConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    authorizationEndpoint: 'https://test.com/auth',
    tokenEndpoint: 'https://test.com/token',
    scope: 'openid email profile',
    validIssuers: ['https://test.com'],
  };

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'test-secret',
          }),
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    provider = new TestOIDCProvider(mockConfig, mockLogger);
  });

  describe('getLoginUrl', () => {
    it('올바른 형식의 login url 생성', () => {
      const url = provider.getLoginUrl();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(url.startsWith(mockConfig.authorizationEndpoint)).toBeTruthy();
      expect(params.get('client_id')).toBe(mockConfig.clientId);
      expect(params.get('redirect_uri')).toBe(mockConfig.redirectUri);
      expect(params.get('response_type')).toBe('code');
      expect(params.get('scope')).toBe(mockConfig.scope);
    });
  });

  describe('exchangeCodeForTokens', () => {
    const mockValidToken = {
      iss: 'https://test.com',
      sub: '12345',
      aud: 'test-client-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('code 를 이용하여 token을 성공적으로 가져와야 한다.', async () => {
      const idToken = jwtService.sign(mockValidToken);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock-access-token',
            id_token: idToken,
            refresh_token: 'mock-refresh-token',
          }),
      });

      const result = await provider.exchangeCodeForTokens('valid-code');

      expect(result).toBeDefined();
      expect(result.sub).toBe(mockValidToken.sub);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe(mockConfig.tokenEndpoint);
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    });

    it('/token endpoint 오류 처리', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'invalid_grant' }),
      });

      await expect(provider.exchangeCodeForTokens('invalid')).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('응답에 id_token이 없는 경우 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            // no id token
          }),
      });

      await expect(provider.exchangeCodeForTokens('valid-code')).rejects.toThrow();
    });
  });

  describe('verifyIdToken', () => {
    it('유효한 id token을 검증한다.', () => {
      const validToken: IdTokenType = {
        iss: 'https://test.com',
        sub: '12345',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => (provider as any).verifyIdToken(validToken)).not.toThrow();
    });

    it('필수값이 없을 경우 error', () => {
      const invalidToken = {
        iss: 'https://test.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      } as any;

      expect(() => (provider as any).verifyIdToken(invalidToken)).toThrow();
    });

    it('iss값이 valid issuer가 아닐 경우 error', () => {
      const invalidToken: IdTokenType = {
        iss: 'https://invalid.com',
        sub: '12345',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => (provider as any).verifyIdToken(invalidToken)).toThrow();
    });

    it('aud가 제공된 client id 와 다를 경우 error', () => {
      const invalidToken: IdTokenType = {
        iss: 'https://test.com',
        sub: '12345',
        aud: 'wrong-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => (provider as any).verifyIdToken(invalidToken)).toThrow();
    });

    it('expired token 일 경우 error', () => {
      const expiredToken: IdTokenType = {
        iss: 'https://test.com',
        sub: '12345',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600,
      };

      expect(() => (provider as any).verifyIdToken(expiredToken)).toThrow();
    });
  });

  describe('parseJwt', () => {
    it('JWT token을 파싱해야 한다', () => {
      const payload = {
        iss: 'https://test.com',
        sub: '12345',
        aud: 'test-client-id',
      };
      const token = jwtService.sign(payload);

      const result = (provider as any).parseJwt(token);
      expect(result).toMatchObject(payload);
    });

    it('invalid jwt format일 경우 에러', () => {
      expect(() => (provider as any).parseJwt('invalid-token')).toThrow('Failed to parse JWT');
    });
  });
});
