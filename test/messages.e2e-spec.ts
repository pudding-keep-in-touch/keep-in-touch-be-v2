import { Emotion } from '@entities/emotion.entity';
import { Question } from '@entities/question.entity';
import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestingApp } from './helpers/create-testing-app.helper';

describe('Messages API test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const loginUserId = '1'; // 테스트용 유저 ID
  const targetUserId = '2'; // 테스트용 유저 ID
  let targetQuestionIds: string[];

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
    const questions = await questionRepository.find({ where: { userId: targetUserId } });
    targetQuestionIds = questions.map((item) => item.questionId);
    if (questions.length === 0) {
      const result = await questionRepository.insert([
        { userId: targetUserId, content: '질문1', isHidden: false },
        { userId: targetUserId, content: '질문2', isHidden: false },
      ]);
      targetQuestionIds = result.identifiers.map((item) => item.questionId);
    }
  });

  afterAll(async () => {
    await dataSource.destroy(); // 데이터베이스 연결 종료
    await app.close(); // 애플리케이션 종료
  });

  describe('POST /messages', () => {
    it('question 에 쪽지 보내기', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: targetUserId,
        content: '테스트 메시지입니다.',
        questionId: targetQuestionIds[0],
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(HttpStatus.CREATED);
          expect(response.body.message).toBe('쪽지가 성공적으로 전송되었습니다.');

          // MessageResponseDto 형식 검증
          expect(response.body.data).toHaveProperty('messageId');
          expect(typeof response.body.data.messageId).toBe('string');
        });
    });

    it('emotion 에 쪽지 보내기', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: targetUserId,
        content: '테스트 메시지입니다.',
        emotionId: '1',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(response.body.status).toBe(HttpStatus.CREATED);
          expect(response.body.message).toBe('쪽지가 성공적으로 전송되었습니다.');

          // MessageResponseDto 형식 검증
          expect(response.body.data).toHaveProperty('messageId');
          expect(typeof response.body.data.messageId).toBe('string');
        });
    });

    // 1, 2 외의 emotionId를 전송하는 경우
    it('존재하지 않는 감정에 쪽지 전송 실패', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: targetUserId,
        content: '테스트 메시지입니다.',
        emotionId: '3',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });
    it('emotionId, questionId 둘 다 제공되면 실패', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: targetUserId,
        content: '테스트 메시지입니다.',
        emotionId: '1',
        questionId: targetQuestionIds[0],
      };

      return request(app.getHttpServer()).post('/messages').send(createMessageDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('emotionId, questionId가 모두 누락되면 실패', () => {
      const createMessageDto: Partial<CreateMessageDto> = {
        receiverId: targetUserId,
        content: 'id 누락케이스',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto as CreateMessageDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('content가 누락되면 실패', () => {
      const createMessageDto: Partial<CreateMessageDto> = {
        receiverId: targetUserId,
        emotionId: '1',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send({
          receiverId: targetUserId,
          emotionId: '1',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('receiverId가 bigint 형식이 아니면 실패', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: 'string',
        content: '테스트 메시지입니다.',
        emotionId: '1',
      };

      return request(app.getHttpServer()).post('/messages').send(createMessageDto).expect(HttpStatus.BAD_REQUEST);
    });
  });
});
