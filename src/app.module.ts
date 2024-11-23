import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from '@common/common.module';
import { validateEnv } from '@configs/process-env.config';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { QuestionsModule } from '@modules/questions/questions.module';
import { UsersModule } from '@modules/users/users.module';

import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      validationSchema: validateEnv,
      isGlobal: true,
    }),
    HealthModule,
    CommonModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // @see https://docs.nestjs.com/fundamentals/testing#overriding-globally-registered-enhancers
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    JwtAuthGuard,
  ],
})
export class AppModule {}
