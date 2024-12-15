import { CustomLogger } from '@logger/custom-logger.service';
import { Injectable } from '@nestjs/common';
import { IdTokenType } from '../types/id-token.type';
import { OIDCConfig } from '../types/oidc.type';
import { UserProfile } from '../types/user-profile.type';

@Injectable()
export abstract class BaseOIDCProvider {
  constructor(
    protected readonly config: OIDCConfig,
    protected readonly logger: CustomLogger,
  ) {}

  /**
   * 소셜 로그인 URL 생성
   * @returns code를 받을 수 있는 URL
   */
  getLoginUrl(): string {
    //if (!this.config.clientId || !this.config.redirectUri) {
    //  throw new Error('Client ID or redirect URI is not defined');
    //}

    // NOTE: state 및 nonce 를 이용한 보안강화 필요
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope,
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * code를 이용하여 access token 및 id token을 받아온다.
   *
   * @param code 인증 서버에서 받은 code
   * @returns
   */
  async exchangeCodeForTokens(code: string): Promise<UserProfile> {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error('Client configuration is incomplete');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      code,
    });

    // except kakao (client secret 필수 아님)
    if (this.config.clientSecret) {
      params.append('client_secret', this.config.clientSecret);
    }

    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        // access_token, refresh_token, id_token, expires_in, token_type, scope
        // (kakao) refresh_token_expires_in
        const errorResponse = await response.json();
        throw new Error(
          `Failed to exchange code for tokens: ${response.status} ${response.statusText}\n${JSON.stringify(errorResponse)}`,
        );
      }

      const tokens = await response.json();

      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error('ID token is missing in the response.');
      }

      const decodedToken = this.parseJwt(idToken);
      this.verifyIdToken(decodedToken);

      return this.getUserProfile(decodedToken);
    } catch (error) {
      this.logger.error(`Failed to exchange code for tokens: ${error.message}`, error.stack);

      throw error;
    }
  }

  /**
   * idToken을 검증한다.
   *
   * @param idToken
   */
  protected verifyIdToken(idToken: IdTokenType): void {
    try {
      if (!idToken || !idToken.iss || !idToken.aud || !idToken.sub || !idToken.exp || !idToken.iat) {
        throw new Error('Invalid ID token format.');
      }

      if (!this.config.validIssuers.includes(idToken.iss)) {
        throw new Error(`Invalid token issuer: ${idToken.iss}`);
      }

      if (idToken.aud !== this.config.clientId) {
        throw new Error(`Invalid token audience: ${idToken.aud}`);
      }

      // 현 시점에서 만료된 토큰은 사용하지 않는다.
      if (idToken.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('ID token is expired.');
      }
    } catch (error) {
      throw new Error(`ID token verification failed: ${error.message}`);
    }
  }

  protected parseJwt(token: string): IdTokenType {
    try {
      const payload = Buffer.from(token.split('.')[1], 'base64').toString();
      return JSON.parse(payload);
    } catch (_error) {
      throw new Error('Failed to parse JWT');
    }
  }

  protected abstract getUserProfile(decodedIdToken: IdTokenType): UserProfile;
}
