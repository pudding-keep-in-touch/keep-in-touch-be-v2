import { CustomLogger } from '@logger/custom-logger.service';
import { CanActivate, ExecutionContext, Injectable, Type, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { OIDC_PROVIDER } from '../decorators/use-oidc.decorator';
import { BaseOIDCProvider } from '../providers/base-oidc.provider';

@Injectable()
export class OIDCGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    private readonly logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const providerClass = this.reflector.get<Type<BaseOIDCProvider>>(OIDC_PROVIDER, context.getHandler());

      if (!providerClass) {
        throw new Error('OIDC provider not specified');
      }

      const provider = this.moduleRef.get<BaseOIDCProvider>(providerClass);

      const request = context.switchToHttp().getRequest();

      if (request.path.endsWith('/login')) {
        const loginUrl = provider.getLoginUrl();
        const response = context.switchToHttp().getResponse();
        response.redirect(loginUrl);
        return true;
      }

      const code = request.query.code;
      if (!code) {
        throw new UnauthorizedException('No authorization code found');
      }

      const userProfile = await provider.exchangeCodeForTokens(code);
      request.user = userProfile;
      return true;
    } catch (error) {
      this.logger.error(error.message, error.stack, 'OIDCGuard authentication failed');
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
