import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { QuestionsModule } from '@modules/questions/questions.module';
import { UsersModule } from '@modules/users/users.module';

import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PostgresConfigService } from '@configs/postgres/postgres-config.service';
import { RootConfigModule } from '@configs/root-config.module';
import { ReactionsModule } from '@modules/reactions/reactions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    RootConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [RootConfigModule],
      useClass: PostgresConfigService,
    }),
    LoggerModule,
    HealthModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    MessagesModule,
    ReactionsModule,
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
