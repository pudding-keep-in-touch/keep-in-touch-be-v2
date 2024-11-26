import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { MessageStatistic } from '@entities/message-statistic.entity';
import { User } from '@entities/user.entity';
import { CustomLogger } from '@logger/custom-logger.service';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

export type TestUser = {
  userId: string;
  email: string;
  nickname: string;
  loginType: number;
};

/**
 * 공통 테스트용 앱 생성 함수
 * @param testUser
 * @returns
 */
export const createTestingApp = async (
  testUser: TestUser[] = [
    {
      userId: '1',
      email: 'test@example.com',
      nickname: 'loginUser',
      loginType: 1,
    },
    {
      userId: '2',
      email: 'test2@exmple.com',
      nickname: 'targetUser',
      loginType: 1,
    },
  ],
): Promise<{ app: INestApplication; dataSource: DataSource }> => {
  const loginUser = testUser[0];
  const targetUser = testUser[1];

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(JwtAuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = {
          userId: loginUser.userId,
          email: loginUser.email,
        };
        return true;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  const dataSource = moduleFixture.get(DataSource);
  const logger = app.get(CustomLogger);

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

  // create or check test user
  const userRepository = dataSource.getRepository(User);
  const existingUser = await userRepository.findOneBy({ userId: loginUser.userId });
  const existingTargetUser = await userRepository.findOneBy({ userId: targetUser.userId });

  await dataSource.manager.transaction(async (manager) => {
    if (!existingUser) {
      await manager.insert(User, loginUser);
    }
    if (!existingTargetUser) {
      await manager.insert(User, targetUser);
    }

    await manager.upsert(
      MessageStatistic,
      [
        {
          userId: loginUser.userId,
          receivedMessageCount: 0,
          sentMessageCount: 0,
          unreadMessageCount: 0,
          unreadReactionCount: 0,
        },
        {
          userId: targetUser.userId,
          receivedMessageCount: 0,
          sentMessageCount: 0,
          unreadMessageCount: 0,
          unreadReactionCount: 0,
        },
      ],
      ['userId'],
    );
  });

  return { app, dataSource };
};
