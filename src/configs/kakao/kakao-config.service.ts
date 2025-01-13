import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoConfigService {
  constructor(private readonly configService: ConfigService) {}

  get clientId() {
    return this.configService.getOrThrow<string>('kakao.clientId');
  }

  get callbackUrl() {
    return this.configService.getOrThrow<string>('kakao.callbackUrl');
  }
}
