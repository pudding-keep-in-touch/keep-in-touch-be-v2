import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoggerModule } from '@logger/logger.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtConfigService } from '@configs/jwt/jwt-config.service';
import { GoogleOIDCGuard } from './guard/google-oidc.guard';
import { KakaoOIDCGuard } from './guard/kakao-oidc.guard';
import { GoogleOIDCProvider } from './providers/google-oidc.provider';
import { KakaoOIDCProvider } from './providers/kakao-oidc.provider';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn },
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleOIDCProvider, KakaoOIDCProvider, GoogleOIDCGuard, KakaoOIDCGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
