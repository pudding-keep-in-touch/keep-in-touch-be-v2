import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService) => {
        return new GoogleStrategy(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: JwtStrategy,
      useFactory: (configService: ConfigService) => {
        return new JwtStrategy(configService);
      },
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
