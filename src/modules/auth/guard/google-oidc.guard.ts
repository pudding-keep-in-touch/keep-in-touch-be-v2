import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleOIDCProvider } from '../providers/google-oidc.provider';

@Injectable()
export class GoogleOIDCGuard implements CanActivate {
  constructor(private provider: GoogleOIDCProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      //const providerType = this.reflector.get<string>('providerType', context.getHandler());

      // 로그인 시도인 경우
      if (request.path.endsWith('/login')) {
        const loginUrl = this.provider.getLoginUrl();
        // redirect를 위해 응답 객체 가져오기
        const response = context.switchToHttp().getResponse();
        response.redirect(loginUrl);
        return true;
      }

      // 콜백 처리
      const code = request.query.code;
      if (!code) {
        throw new UnauthorizedException('No authorization code found');
      }

      const userProfile = await this.provider.exchangeCodeForTokens(code);
      request.user = userProfile;

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}
