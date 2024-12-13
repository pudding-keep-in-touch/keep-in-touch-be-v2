import { ConfigService } from '@nestjs/config';

export class KakaoConfigService {
  constructor(private readonly configService: ConfigService) {}

  get clientId() {
    return this.configService.get<string>('kakao.clientId');
  }

  get callbackUrl() {
    return this.configService.get<string>('kakao.callbackUrl');
  }
}
