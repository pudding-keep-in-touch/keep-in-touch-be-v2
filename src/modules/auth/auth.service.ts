import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtConfigService } from '@configs/jwt/jwt-config.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async googleLogin(googleUser: any) {
    const { userId, email } = await this.usersService.createOrGetGoogleUser(googleUser);

    const payload = { email: email, sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfigService.secret,
      expiresIn: this.jwtConfigService.expiresIn,
    });

    return { accessToken, userId };
  }

  async kakaoLogin(kakaoUser: any) {
    const { userId, email } = await this.usersService.createOrGetKakaoUser(kakaoUser);

    const payload = { email: email, sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfigService.secret,
      expiresIn: this.jwtConfigService.expiresIn,
    });
    return { accessToken, userId };
  }
}
