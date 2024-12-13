import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleConfigService {
  constructor(private readonly configService: ConfigService) {}

  get clientId() {
    return this.configService.get<string>('google.clientId');
  }

  get clientSecret() {
    return this.configService.get<string>('google.clientSecret');
  }

  get callbackUrl() {
    return this.configService.get<string>('google.callbackUrl');
  }
}
