import { QUESTION_COUNT_LIMIT } from '@modules/questions/constants/question.constant';
import { CreateQuestionDto } from '@modules/questions/dto/create-question.dto';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { Question } from '@entities/question.entity';
import { UpdateQuestionHiddenDto } from '@modules/questions/dto/update-question-hidden';
import { createTestingApp } from './helpers/create-testing-app.helper';

describe('Questions API test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let questionRepository: Repository<Question>;
  let createdQuestionIds: string[] = []; // 생성된 questionId 추적용
  const testUserId = '1'; // 테스트용 유저 ID

  beforeAll(async () => {
    // 1, 2 번 유저 생성
    const testApp = await createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;
    questionRepository = dataSource.getRepository(Question);
    await app.init();

    await questionRepository.delete({ userId: testUserId });

    let question = await questionRepository.findOne({ where: { userId: testUserId } });
    if (!question) {
      question = questionRepository.create({
        content: '테스트 질문입니다.',
        isHidden: false,
        userId: testUserId,
      });
      await questionRepository.save(question);
    }
  });

  beforeEach(() => {
    createdQuestionIds = []; // 테스트 시작 전 초기화
  });

  afterAll(async () => {
    await dataSource.destroy(); // 데이터베이스 연결 종료
    await app.close(); // 애플리케이션 종료
  });

  afterEach(async () => {
    if (createdQuestionIds.length > 0) {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('questionId IN (:...ids)', { ids: createdQuestionIds })
        .execute();
    }
    createdQuestionIds = []; // 배열 초기화
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
          createdQuestionIds.push(questionId);

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

      const questionCount = await questionRepository.count({ where: { userId: testUserId } });

      // 먼저 10개의 질문 생성
      for (let i = 0; i < QUESTION_COUNT_LIMIT - questionCount; i++) {
        const response = await request(app.getHttpServer()).post('/questions').send(createQuestionDto).expect(201);
        createdQuestionIds.push(response.body.data.questionId);
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

  describe('PATCH /questions/:questionId', () => {
    it('user가 작성한 question의 숨김 처리 가능', async () => {
      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };
      const question = await questionRepository.findOne({ where: { userId: testUserId } });
      if (!question) {
        throw new Error('테스트용 질문이 없습니다.');
      }
      const questionId = question.questionId;

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
      const questionId = '1';
      if (await questionRepository.findOne({ where: { questionId } })) {
        await questionRepository.delete({ questionId });
      }

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(404);
    });

    it('잘못된 입력값이면 400', async () => {
      const updateQuestionHiddenDto = {
        isHidden: 'xxx', // boolean이 아닌 문자열
      };
      const question = await questionRepository.findOne({ where: { userId: testUserId } });
      if (!question) {
        throw new Error('테스트용 질문이 없습니다.');
      }
      const questionId = question.questionId;

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .send(updateQuestionHiddenDto);

      expect(response.status).toBe(400);
    });

    it('다른 유저의 질문일 경우 403', async () => {
      const updateQuestionHiddenDto: UpdateQuestionHiddenDto = {
        isHidden: true,
      };
      let question = await questionRepository.findOne({ where: { userId: '2' } });
      if (!question) {
        question = questionRepository.create({
          content: '테스트 질문입니다.',
          isHidden: false,
          userId: '2',
        });
        await questionRepository.save(question);
      }
      const questionId = question.questionId;

      createdQuestionIds.push(questionId);

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
