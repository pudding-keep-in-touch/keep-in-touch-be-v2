import { ConfigService } from '@nestjs/config';

export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  get secret() {
    return this.configService.get<string>('jwt.secret');
  }

  get expiresIn() {
    return this.configService.get<string>('jwt.expiresIn');
  }
}
