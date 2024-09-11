import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    const callbackURL = 'http://localhost:3000/v1/auth/google/callback';

    // ConfigService를 명시적으로 사용한다는 것을 알려주기 위해 로그를 찍어줍니다.
    console.log('ConfigService initialized', configService);

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    console.log(accessToken, refreshToken);
    try {
      const { name, emails, photos } = profile;
      console.log('profile:', profile);
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        photo: photos[0].value,
      };
      console.log('user', user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
