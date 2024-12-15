import { ConfigService } from '@nestjs/config';

export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  get secret() {
    return this.configService.getOrThrow<string>('jwt.secret');
  }

  get expiresIn() {
    return this.configService.getOrThrow<string>('jwt.expiresIn');
  }
}
