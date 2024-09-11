import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    // console.log(configService.get<string>('JWT_SECRET'));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123123',
    });
  }

  async validate(payload: any) {
    // const user = await this.usersService.findById(payload.sub);
    console.log(payload);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
  }
}
