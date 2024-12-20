import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestFixtureManager } from './helpers/fixtures';
import { TestSetup } from './test-setup';

describe('Messages API test', () => {
  let testSetup: TestSetup;
  let testData: Awaited<ReturnType<TestFixtureManager['createBasicTestData']>>;
  let app: INestApplication;
  let loginUserId: string;
  let targetUserId: string;

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
      userId: testData.users.loginUser.userId,
      email: testData.users.loginUser.email,
      nickname: testData.users.loginUser.nickname,
    });

    targetUserId = testData.users.targetUser.userId;
    loginUserId = testData.users.loginUser.userId;
    loginToTargetMessageId = testData.messages[0].messageId;
    targetToLoginMessageId = testData.messages[1].messageId;
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  describe('POST /messages', () => {
    it('question 에 쪽지 보내기', () => {
      const createMessageDto: CreateMessageDto = {
        receiverId: testData.users.targetUser.userId,
        content: '테스트 메시지입니다.',
        questionId: testData.questions[0].questionId,
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
        questionId: testData.questions[0].questionId,
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

  describe('GET /messages/:messageId', () => {
    it('보낸 메시지 상세 조회 성공', () => {
      return request(app.getHttpServer())
        .get(`/messages/${testData.messages[0].messageId}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('messageId');
          expect(response.body.data).toHaveProperty('type', 'sent');
          expect(response.body.data).toHaveProperty('content');
          expect(response.body.data).toHaveProperty('emotion');
          expect(response.body.data.emotion).toHaveProperty('emotionId', '1');
          expect(response.body.data.emotion).toHaveProperty('name', '응원과 감사');
          expect(response.body.data.emotion).toHaveProperty('emoji', '🌟');
        });
    });

    it('받은 메시지 상세 조회 성공', () => {
      return request(app.getHttpServer())
        .get(`/messages/${testData.messages[1].messageId}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('messageId');
          expect(response.body.data).toHaveProperty('type', 'received');
          expect(response.body.data).toHaveProperty('content');
          expect(response.body.data).toHaveProperty('question');
          expect(response.body.data.question).toHaveProperty('content');
        });
    });

    it('존재하지 않는 메시지 조회시 404', () => {
      return request(app.getHttpServer())
        .get('/messages/999999')
        .expect(HttpStatus.NOT_FOUND)
        .expect((response) => {
          expect(response.body).toHaveProperty('message', '쪽지가 존재하지 않습니다.');
        });
    });

    it('권한이 없는 메시지 조회시 403', async () => {
      // Create a message between other users
      const user = await testSetup.fixtures.userFactory.create(); // 임의 유저 생성

      const { messageId } = await testSetup.fixtures.messageFactory.createEmotionMessage('1', {
        senderId: user.userId,
        receiverId: targetUserId,
      });
      return request(app.getHttpServer())
        .get(`/messages/${messageId}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect((response) => {
          expect(response.body).toHaveProperty('message', '쪽지를 볼 권한이 없습니다.');
        });
    });
  });

  describe('PATCH /messages/:messageId', () => {
    it('쪽지 상태 변경 성공', () => {
      return request(app.getHttpServer())
        .patch(`/messages/${targetToLoginMessageId}`)
        .send({ status: 'hidden' })
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('messageId', targetToLoginMessageId);
          expect(response.body.data).toHaveProperty('status', 'hidden');
        });
    });

    it('존재하지 않는 쪽지 상태 변경시 404', () => {
      return request(app.getHttpServer())
        .patch('/messages/999999')
        .send({ status: 'hidden' })
        .expect(HttpStatus.NOT_FOUND)
        .expect((response) => {
          expect(response.body.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('잘못된 status 값을 줄 경우 400', () => {
      return request(app.getHttpServer())
        .patch(`/messages/${targetToLoginMessageId}`)
        .send({ status: 'invalid' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('자신이 받은 쪽지가 아닌 경우 403', () => {
      return request(app.getHttpServer())
        .patch(`/messages/${loginToTargetMessageId}`)
        .send({ status: 'hidden' })
        .expect(HttpStatus.FORBIDDEN)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.status).toBe(HttpStatus.FORBIDDEN);
        });
    });

    it('status가 누락된 경우 400', () => {
      return request(app.getHttpServer())
        .patch(`/messages/${targetToLoginMessageId}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('message id가 bigint 형식이 아닌 경우 400', () => {
      return request(app.getHttpServer())
        .patch(`/messages/invalid`)
        .send({ status: 'hidden' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });
  });

  describe('POST /messages/:messageId/reactions', () => {
    it('쪽지에 반응 추가 성공', () => {
      return request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({ templateIds: ['1', '2'] })
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('messageId', targetToLoginMessageId);
          expect(response.body.data).toHaveProperty('reactionIds');
          expect(response.body.data.reactionIds).toHaveLength(2);
        });
    });

    it('존재하지 않는 쪽지에 반응 추가시 404', () => {
      return request(app.getHttpServer())
        .post('/messages/999999/reactions')
        .send({ templateIds: ['1', '2'] })
        .expect(HttpStatus.NOT_FOUND)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('이미 반응이 추가된 쪽지에 반응 추가시 409', async () => {
      // 초기 반응 추가
      await request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({ templateIds: ['1', '2'] });

      return request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({ templateIds: ['1', '2'] })
        .expect(HttpStatus.CONFLICT)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('유효하지 않은 reaction template id 포함시 400', () => {
      return request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({ templateIds: ['1', '111991'] })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('숫자 형식이 아닌 reaction template id 포함시 400', () => {
      return request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({ templateIds: ['1', 'invalid'] })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('reaction template id가 누락된 경우 400', () => {
      return request(app.getHttpServer())
        .post(`/messages/${targetToLoginMessageId}/reactions`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('message id가 bigint 형식이 아닌 경우 400', () => {
      return request(app.getHttpServer())
        .post(`/messages/invalid/reactions`)
        .send({ templateIds: ['1', '2'] })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });
  });
});
