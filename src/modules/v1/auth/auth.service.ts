import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async googleLogin(googleUser: any) {
    const user = await this.usersService.createOrUpdateGoogleUser(googleUser);

    // JWT 토큰 생성 로직
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }
}
