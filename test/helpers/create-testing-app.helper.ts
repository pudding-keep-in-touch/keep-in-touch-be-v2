import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SentryModule } from '@sentry/nestjs/setup';

import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { CustomLogger } from '@logger/custom-logger.service';

import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
}

class MockSentryModule {
  static forRoot() {
    return {
      module: MockSentryModule,
      providers: [],
    };
  }
}

export const createTestingApp = async (): Promise<TestContext> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    //.overrideProvider(PostgresConfigService)
    //.useClass(TestDatabaseConfigService)
    .overrideProvider(JwtAuthGuard)
    .useValue({
      canActivate: (_context: ExecutionContext) => {
        // loginUser는 fixtures에서 생성된 후 설정됨
        return true;
      },
    })
    .overrideModule(SentryModule)
    .useModule(MockSentryModule)
    .compile();

  const app = moduleFixture.createNestApplication();
  const dataSource = moduleFixture.get(DataSource);
  const logger = app.get(CustomLogger);

  // sentry init mock
  jest.mock('@sentry/node', () => ({
    init: jest.fn(),
    nodeProfilingIntegration: jest.fn(() => ({})),
  }));

  // 기본 앱 설정
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  return { app, dataSource };
};
