import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly authService: AuthService,
        // private readonly configService: ConfigService,
    ) {
        console.log('GoogleStrategy constructor called');
        super({
            //여기에 그거
            callbackURL: 'http://localhost:3000/v1/auth/google/callback',
            scope: ['email', 'profile'],
        });
        // super({
        //     clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
        //     clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
        //     callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
        //     scope: ['email', 'profile'],
        // });
    }

    async validate(
        accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        console.log('GoogleStrategy validate method called');
        console.log('Profile received from Google:', profile);
        const { emails, name } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            accessToken,
        };

        console.log('User created from Google profile:', user);
        const userFromDb = await this.authService.validateUser(user);
        console.log('User from DB or new user:', userFromDb);
        done(null, userFromDb);
    }
}

