import { SetMetadata, Type, UseGuards, applyDecorators } from '@nestjs/common';
import { OIDCGuard } from '../guards/oidc.guard';
import { BaseOIDCProvider } from '../providers/base-oidc.provider';

export const OIDC_PROVIDER = 'oidc_provider';

export function UseOIDC(provider: Type<BaseOIDCProvider>) {
  return applyDecorators(SetMetadata(OIDC_PROVIDER, provider), UseGuards(OIDCGuard));
}
