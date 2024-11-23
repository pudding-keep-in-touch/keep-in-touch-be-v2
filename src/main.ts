import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { CustomLogger } from '@logger/custom-logger.service';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  app.setGlobalPrefix('v2', { exclude: ['health'] });

  // swagger 설정
  const config = new DocumentBuilder()
    .setTitle(`${configService.get('APP_NAME')}_${configService.get('APP_ENV')}`)
    .setDescription('API description')
    .setVersion('2.0')
    // .addTag('your-tag')
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
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v2', app, document);

  await app.listen(configService.get('APP_PORT') || 3000);
}
bootstrap();
