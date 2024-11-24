import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { CustomLogger } from '@logger/custom-logger.service';
import { QUESTION_COUNT_LIMIT } from '@modules/questions/constants/question.constant';
import { CreateQuestionDto } from '@modules/questions/dto/create-question.dto';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

describe('Questions API test', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = {
            userId: '1',
            email: 'test@example.com',
          };
          return true; // 모든 요청을 허용
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);

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

    await app.init();
  });

  beforeEach(() => {
    // 데이터 초기화
    return dataSource.query('DELETE FROM questions WHERE user_id = 1');
  });

  describe('POST /questions', () => {
    it('성공적인 질문 생성 및 응답 형식 검증', () => {
      const createQuestionDto: CreateQuestionDto = {
        content: '테스트 질문입니다.',
        isHidden: false,
      };

      return request(app.getHttpServer())
        .post('/questions')
        .send(createQuestionDto)
        .expect(201)
        .expect((response) => {
          // BaseResponseDto 형식 검증
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(201);

          // ResponseCreateQuestionDto 형식 검증
          expect(response.body.data).toHaveProperty('questionId');
          expect(typeof response.body.data.questionId).toBe('string');

          // json 에서 string으로 변환되기 때문에 "숫자"형식 string인지 판단해야 함.
          const questionId = Number(response.body.data.questionId);
          expect(Number.isInteger(questionId)).toBeTruthy();

          // 메시지 검증
          expect(response.body.message).toBe('질문이 성공적으로 등록되었습니다.');
        });
    });

    it('잘못된 입력값 검증', () => {
      const invalidDto = {
        content: '', // 빈 문자열
        isHidden: false,
      };

      return request(app.getHttpServer())
        .post('/questions')
        .send(invalidDto)
        .expect(400)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');
          // ValidationPipe의 에러 메시지 검증
          expect(response.body.message).toBe('질문 내용은 2자 이상 140자 이하여야 합니다.');
        });
    });

    it('질문 생성 제한 초과 시 응답 형식 검증', async () => {
      const createQuestionDto: CreateQuestionDto = {
        content: '테스트 질문입니다.',
        isHidden: false,
      };

      // 먼저 10개의 질문 생성
      for (let i = 0; i < QUESTION_COUNT_LIMIT; i++) {
        await request(app.getHttpServer()).post('/questions').send(createQuestionDto).expect(201);
      }

      // 11번째 질문 시도
      return request(app.getHttpServer())
        .post('/questions')
        .send(createQuestionDto)
        .expect(409)
        .expect((response) => {
          expect(response.body).toMatchObject({
            status: 409,
            message: '질문은 10개까지만 생성할 수 있습니다.',
            data: null,
          });
        });
    });
  });
});
