import { QUESTION_COUNT_LIMIT } from '@modules/questions/constants/question.constant';
import { CreateQuestionDto } from '@modules/questions/dto/create-question.dto';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { CustomLogger } from '@logger/custom-logger.service';
import { ResponseGetSharedQuestionDetailDto } from '@modules/questions/dto/get-shared-question-detail.dto';
import { UpdateQuestionHiddenDto } from '@modules/questions/dto/update-question-hidden';
import { TestFixtureManager } from './helpers/fixtures';
import { TestSetup } from './test-setup';

describe('Questions API test', () => {
  let testSetup: TestSetup;
  let testData: Awaited<ReturnType<TestFixtureManager['createBasicTestData']>>;
  let app: INestApplication;
  let targetUserId: string;
  let loginUserId: string;

  let loginToTargetMessageId: string;
  let targetToLoginMessageId: string;

  beforeAll(async () => {
    testSetup = await new TestSetup().init();
    app = testSetup.app;
  });

  beforeEach(async () => {
    await testSetup.fixtures.cleanDatabase();
    testData = await testSetup.fixtures.createBasicTestData();

    testSetup.setUser({
      userId: testData.users.sender.userId,
      email: testData.users.sender.email,
      nickname: testData.users.sender.nickname,
    });

    testSetup.setUser({
      userId: testData.users.sender.userId,
      email: testData.users.sender.email,
      nickname: testData.users.sender.nickname,
    });

    targetUserId = testData.users.receiver.userId;
    loginUserId = testData.users.sender.userId;
    loginToTargetMessageId = testData.messages[0].messageId;
    targetToLoginMessageId = testData.messages[1].messageId;
  });

  afterAll(async () => {
    await testSetup.cleanup();
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
          const questionId = response.body.data.questionId;
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

      // 먼저 LIMIT개의 질문 생성 - fixture에는 loginUser가 아니라 targetUserId로 생성되어있으므로 정직하게 30개 생성하면 됨
      for (let i = 0; i < QUESTION_COUNT_LIMIT; i++) {
        const response = await request(app.getHttpServer()).post('/questions').send(createQuestionDto).expect(201);
      }

      // LIMIT + 1번째 질문 시도
      return request(app.getHttpServer())
        .post('/questions')
        .send(createQuestionDto)
        .expect(409)
        .expect((response) => {
          expect(response.body).toMatchObject({
            status: 409,
            message: `질문은 ${QUESTION_COUNT_LIMIT}개까지만 생성할 수 있습니다.`,
            data: null,
          });
        });
    });
  });

  describe('GET /questions', () => {
    it('userId에 해당하는, isHidden:false 질문 리스트 반환.', async () => {
      // 숨겨진, 숨겨지지 않은 5개의 질문 생성.
      const questions = await testSetup.fixtures.questionFactory.createMany(4, {
        userId: loginUserId,
        isHidden: false,
      });
      await testSetup.fixtures.questionFactory.createMany(6, {
        userId: loginUserId,
        isHidden: true,
      });

      const unhiddenQuestionIds = questions.map((question) => question.questionId);

      const response = await request(app.getHttpServer()).get(`/questions?userId=${loginUserId}`).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe(200);
      expect(response.body.message).toBeDefined();

      // 2. 데이터 배열 검증
      const { data } = response.body;
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBe(4);

      // 3. 각 데이터 검증
      for (const question of data) {
        expect(question).toHaveProperty('userId');
        expect(question).toHaveProperty('questionId');
        expect(question).toHaveProperty('content');
        expect(question).toHaveProperty('createdAt');

        // question id is in questionsIds
        expect(unhiddenQuestionIds).toContain(question.questionId);

        expect(question.userId).toBe(loginUserId);
      }
    });

    it('userId query parameter가 없으면 400', () => {
      return request(app.getHttpServer())
        .get('/questions')
        .expect(400)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(400);
        });
    });

    it('bigint 범위가 아닌 userId 값이 오면 400', () => {
      return request(app.getHttpServer())
        .get('/questions?userId=abc')
        .expect(400)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(400);
        });
    });
  });

  describe('GET /questions/:questionId', () => {
    it('questionId에 해당하는 질문 반환', async () => {
      const questionId = testData.questions[0].questionId;
      const userId = testData.questions[0].userId;

      return request(app.getHttpServer())
        .get(`/questions/${questionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(200);

          const data: ResponseGetSharedQuestionDetailDto = response.body.data;
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('questionId');
          expect(data).toHaveProperty('content');
          expect(data).toHaveProperty('createdAt');
          expect(data).toHaveProperty('isHidden');

          expect(data.userId).toBe(userId);
          expect(data.content).toBe(testData.questions[0].content);
        });
    });

    it('숨김 처리된 질문이어도 값을 반환해야 한다.', async () => {
      // 남이 만든 숨김 질문
      const { questionId, content } = await testSetup.fixtures.questionFactory.create({
        userId: targetUserId,
        isHidden: true,
      });

      return request(app.getHttpServer())
        .get(`/questions/${questionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(200);

          const data: ResponseGetSharedQuestionDetailDto = response.body.data;
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('questionId');
          expect(data).toHaveProperty('content');
          expect(data).toHaveProperty('createdAt');
          expect(data).toHaveProperty('isHidden');

          expect(data.userId).toBe(targetUserId);
          expect(data.content).toBe(content);
          expect(data.isHidden).toBe(true);
        });
    });

    it('없는 questionId일 경우 404', async () => {
      return request(app.getHttpServer())
        .get('/questions/99999999999999999')
        .expect(404)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(404);
        });
    });

    it('bigint 범위가 아닌 questionId 값이 오면 400', () => {
      return request(app.getHttpServer())
        .get('/questions/+1234')
        .expect(400)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(400);
        });
    });
  });

  describe('PATCH /questions/:questionId', () => {
    it('user가 작성한 question의 숨김 처리 가능', async () => {
      const { questionId } = await testSetup.fixtures.questionFactory.create({ userId: loginUserId });

      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ questionId, isHidden: true });
    });

    it('없는 question id일 경우 Not Found', async () => {
      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };
      const questionId = '10000';

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(404);
    });

    it('잘못된 입력값이면 400', async () => {
      const updateQuestionHiddenDto = {
        isHidden: 'xxx', // boolean이 아닌 문자열
      };

      const questionId = testData.questions[0].questionId;

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(400);
    });

    it('다른 유저의 질문일 경우 403', async () => {
      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };

      const { questionId } = await testSetup.fixtures.questionFactory.create({
        userId: targetUserId,
        content: '다른 유저의 질문',
        isHidden: false,
      });

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(403);
    });

    it('잘못된 questionId로 요청 시 400 에러', async () => {
      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };
      const questionId = '-9';

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(400);
    });
  });
});
