import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SwaggerStatsConfigService {
  constructor(private readonly configService: ConfigService) {}

  get username() {
    return this.configService.getOrThrow<string>('swaggerStats.username');
  }

  get password() {
    return this.configService.getOrThrow<string>('swaggerStats.password');
  }
}
