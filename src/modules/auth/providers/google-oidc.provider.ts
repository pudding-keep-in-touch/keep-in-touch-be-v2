import { GoogleConfigService } from '@configs/google/google-config.service';
import { CustomLogger } from '@logger/custom-logger.service';
import { Injectable } from '@nestjs/common';
import { GoogleIdTokenType } from '../types/id-token.type';
import { OIDCConfig } from '../types/oidc.type';
import { SocialUserProfile } from '../types/user-profile.type';
import { BaseOIDCProvider } from './base-oidc.provider';

@Injectable()
export class GoogleOIDCProvider extends BaseOIDCProvider {
  constructor(googleConfigService: GoogleConfigService, logger: CustomLogger) {
    const config: OIDCConfig = {
      clientId: googleConfigService.clientId,
      clientSecret: googleConfigService.clientSecret,
      redirectUri: googleConfigService.callbackUrl,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scope: 'openid email profile',
      validIssuers: ['https://accounts.google.com', 'accounts.google.com'],
    };
    super(config, logger);
  }

  protected getUserProfile(decodedIdToken: GoogleIdTokenType): SocialUserProfile {
    if (!decodedIdToken.email) {
      throw new Error('Email is required, 이메일이 인증되지 않은 구글 계정입니다');
    }

    return {
      sub: decodedIdToken.sub,
      email: decodedIdToken.email,
      nickname: decodedIdToken.name,
    };
  }
}
