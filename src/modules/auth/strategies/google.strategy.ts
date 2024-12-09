import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback } from 'passport-google-oauth20';

type GoogleProfile = {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
  provider: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  // NOTE: _로 시작하는 변수는 사용하지 않는 변수를 의미함
  async validate(_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyCallback) {
    try {
      const { emails, photos, displayName } = profile;
      const user = {
        email: emails[0].value,
        displayName: displayName,
        photo: photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
