import { SetMetadata } from '@nestjs/common';

export const OIDC_PROVIDER_KEY = 'oidc_provider';
// kakao, google 등의 provider를 받아서 SetMetadata를 통해 OIDC_PROVIDER_KEY에 저장
export const OIDCAuth = (provider: string) => SetMetadata(OIDC_PROVIDER_KEY, provider);
