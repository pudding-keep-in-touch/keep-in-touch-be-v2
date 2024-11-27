import { Emotion } from '@entities/emotion.entity';
import { Question } from '@entities/question.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestingApp } from './helpers/create-testing-app.helper';

describe('Users API test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const loginUserId = '1'; // 테스트용 유저 ID
  const targetUserId = '2'; // 테스트용 유저 ID
  let targetQuestionIds: string[];
  const hiddenQuestionContent = '숨김질문';
  const insertQuestions = [
    { userId: loginUserId, content: '질문1', isHidden: false },
    { userId: loginUserId, content: '질문2', isHidden: false },
    { userId: loginUserId, content: hiddenQuestionContent, isHidden: true },
  ];

  beforeAll(async () => {
    const testApp = await createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;
    await app.init();

    const emotionRepository = dataSource.getRepository(Emotion);
    const emotions = await emotionRepository.find();
    if (emotions.length === 0) {
      await emotionRepository.insert([
        { emotionId: '1', name: '응원과 감사', emoji: '🌟' },
        { emotionId: '2', name: '솔직한 대화', emoji: '🤝' },
      ]);
    }

    const questionRepository = dataSource.getRepository(Question);
    questionRepository.delete({ userId: loginUserId });

    const result = await questionRepository.insert(insertQuestions);
    targetQuestionIds = result.identifiers.map((item) => item.questionId);
  });

  afterAll(async () => {
    await dataSource.destroy(); // 데이터베이스 연결 종료
    await app.close(); // 애플리케이션 종료
  });

  describe('GET /users/:userId/questions', () => {
    it('유저가 작성한 질문 조회. 숨김여부 상관없이 모든 question 응답', () => {
      return request(app.getHttpServer())
        .get(`/users/${loginUserId}/questions`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          const { body } = response;
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(body.data).toBeInstanceOf(Array);
          expect(body.data.length).toBe(3);

          for (const q of body.data) {
            expect(q).toHaveProperty('questionId');
            expect(q).toHaveProperty('content');
            expect(q).toHaveProperty('isHidden');
            expect(q).toHaveProperty('createdAt');
          }
        });
    });

    it('유저가 작성한 질문이 없을 때 data에 빈 배열 응답', () => {
      dataSource.getRepository(Question).delete({ userId: loginUserId });

      const res = request(app.getHttpServer())
        .get(`/users/${loginUserId}/questions`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          const { body } = response;
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(body.data).toBeInstanceOf(Array);
          expect(body.data.length).toBe(0);
        });

      dataSource.getRepository(Question).insert(insertQuestions);
      return res;
    });

    it('로그인한 유저와 조회 대상 유저가 다를 때 403 에러', () => {
      return request(app.getHttpServer())
        .get(`/users/${targetUserId}/questions`)
        .set('userId', loginUserId)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
