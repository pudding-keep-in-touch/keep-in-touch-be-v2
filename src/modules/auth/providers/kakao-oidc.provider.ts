import { KakaoConfigService } from '@configs/kakao/kakao-config.service';
import { CustomLogger } from '@logger/custom-logger.service';
import { Injectable } from '@nestjs/common';
import { KakaoIdTokenType } from '../types/id-token.type';
import { OIDCConfig } from '../types/oidc.type';
import { SocialUserProfile } from '../types/user-profile.type';
import { BaseOIDCProvider } from './base-oidc.provider';

@Injectable()
export class KakaoOIDCProvider extends BaseOIDCProvider {
  constructor(kakaoConfigService: KakaoConfigService, logger: CustomLogger) {
    const config: OIDCConfig = {
      clientId: kakaoConfigService.clientId,
      redirectUri: kakaoConfigService.callbackUrl,
      authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
      tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
      scope: 'openid account_email profile_nickname',
      validIssuers: ['https://kauth.kakao.com'],
    };
    super(config, logger);
  }

  protected getUserProfile(decodedIdToken: KakaoIdTokenType): SocialUserProfile {
    if (!decodedIdToken.email) {
      throw new Error('Email is required, 이메일이 인증되지 않은 카카오 계정입니다');
    }

    return {
      sub: decodedIdToken.sub,
      email: decodedIdToken.email,
      nickname: decodedIdToken.nickname,
    };
  }
}
