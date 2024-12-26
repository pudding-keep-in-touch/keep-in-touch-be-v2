import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoggerModule } from '@logger/logger.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtConfigService } from '@configs/jwt/jwt-config.service';
import { OIDCGuard } from './guards/oidc.guard';
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
      inject: [JwtConfigService],
    }),
    LoggerModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleOIDCProvider, KakaoOIDCProvider, OIDCGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
