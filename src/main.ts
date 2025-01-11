import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { AppConfigService } from '@configs/app/app-config.service';
import { CustomLogger } from '@logger/custom-logger.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerStats from 'swagger-stats';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.TZ = 'UTC'; // FIXME: 서버시간을 강제로 UTC로 설정
  // 이유: KST 인 호스트에서 실행되면 timestamp without timezone으로 저장된 모든 데이터가 실제보다 9시간 빠르게 조회됨
  // pagination 등에서 엄청난 데이터 불일치가 발생함.
  // 서버를 UTC로 설정해서 해결 가능.
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);
  const logger = app.get(CustomLogger);

  app.useLogger(logger);
  // 환경 변수 로드
  const environment = appConfigService.env || 'development';
  logger.log(`Application is running in ${environment} mode`, 'Bootstrap');

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [appConfigService.clientUrl]
      : [
          appConfigService.clientUrl, // dev 환경의 프론트엔드 URL
          'http://localhost:3000', // 로컬 개발 환경
          /^http:\/\/localhost:[0-9]+$/, // 또는 모든 로컬 포트 허용
        ];

  //NOTE: CORS 설정. method 추가 시 수정
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET, HEAD, PATCH, POST, OPTIONS', // EXCEPT PUT, DELETE
    allowedHeaders: 'Content-Type, Authorization', // accept: 기본 cors 허용 헤더
    credentials: true,
    maxAge: appConfigService.env === 'production' ? 3600 : 5, // 1시간
    // preflightContinue: false - default setting
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
    .setTitle(`${appConfigService.name}_${appConfigService.env}`)
    .setDescription('API description')
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v2', app, document);

  app.use(swaggerStats.getMiddleware({ swaggerSpec: document }));

  // 문서의 모든 API description을 순회하면서 플레이스홀더 치환
  for (const path of Object.values(document.paths)) {
    for (const method of Object.values(path)) {
      if (method.description) {
        method.description = method.description.replace('${APP_URL}', `${appConfigService.url}`);
      }
    }
  }

  await app.listen(appConfigService.port || 3000);
}
bootstrap();
