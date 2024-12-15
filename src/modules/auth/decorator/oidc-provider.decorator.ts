import { Injectable } from '@nestjs/common';

// decorators/oidc-provider.decorator.ts
export const OIDC_PROVIDER_METADATA = 'oidc_provider_type';

export const OIDCProvider = (type: string): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata(OIDC_PROVIDER_METADATA, type, target);
    return Injectable()(target);
  };
};
