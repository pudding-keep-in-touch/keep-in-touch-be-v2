import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get name() {
    return this.configService.getOrThrow<string>('app.name');
  }

  get env() {
    return this.configService.getOrThrow<string>('app.env');
  }

  get url() {
    return this.configService.getOrThrow<string>('app.url');
  }

  get port() {
    return Number(this.configService.getOrThrow<number>('app.port'));
  }

  get clientUrl() {
    return this.configService.getOrThrow<string>('app.redirectUrl');
  }
}
