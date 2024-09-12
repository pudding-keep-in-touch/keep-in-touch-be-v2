import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/v1/users/users.service';
import { Users } from '@entities/users.entity';
import { UserStatus } from '@v1/users/user.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<Users> {
    const user = await this.usersService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    switch (user.status) {
      case UserStatus.NORMAL:
        return user;
      case UserStatus.SUSPENDED:
        throw new UnauthorizedException('계정이 정지되었습니다.');
      default:
        throw new UnauthorizedException('유효하지 않은 계정 상태입니다.');
    }
  }
}
