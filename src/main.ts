import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { CustomLogger } from '@logger/custom-logger.service';
import { AuthModule as AuthV1Module } from '@v1/auth/auth.module';
import { DirectMessagesModule as DirectV1MessagesModule } from '@v1/direct-messages/direct-messages.module';
import { UsersModule as UsersV1Module } from '@v1/users/users.module';
import { AuthModule as AuthV2Module } from '@v2/auth/auth.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  const logger = app.get(CustomLogger);
  app.useLogger(logger);
  // 환경 변수 로드
  const environment = configService.get('APP_ENV') || 'development';
  logger.log(`Application is running in ${environment} mode`, 'Bootstrap');

  //FIXME: 더 안전한 CORS 설정 필요
  app.enableCors();

  ConfigModule.forRoot({
    isGlobal: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const v1Options = new DocumentBuilder()
    .setTitle('API V1')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'jwt',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const v2Options = new DocumentBuilder()
    .setTitle('API v2')
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'jwt',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const v1Document = SwaggerModule.createDocument(app, v1Options, {
    include: [UsersV1Module, AuthV1Module, DirectV1MessagesModule],
  });

  const v2Document = SwaggerModule.createDocument(app, v2Options, {
    include: [AuthV2Module],
  });

  SwaggerModule.setup('api/v1', app, v1Document);
  SwaggerModule.setup('api/v2', app, v2Document);

  await app.listen(configService.get('APP_PORT') || 3000);
}
bootstrap();
