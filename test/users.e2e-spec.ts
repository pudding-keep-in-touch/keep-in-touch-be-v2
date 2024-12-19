import { Question } from '@entities/question.entity';
import { GetMySentMessagesDto } from '@modules/users/dto/get-my-messages.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { TestFixtureManager } from './helpers/fixtures';
import { TestSetup } from './test-setup';

describe('Users API test', () => {
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

  describe('GET /users/:userId/questions', () => {
    it('유저가 작성한 질문 조회. 숨김여부 상관없이 모든 question 응답', async () => {
      await testSetup.fixtures.questionFactory.createMany(10, {
        userId: loginUserId,
      });
      await testSetup.fixtures.questionFactory.createMany(10, {
        userId: loginUserId,
        isHidden: true,
      });
      const baseQuestionLen = testData.questions.filter((q) => q.userId === loginUserId).length;

      return request(app.getHttpServer())
        .get(`/users/${loginUserId}/questions`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          const { body } = response;
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('status');

          expect(body.data).toBeInstanceOf(Array);
          expect(body.data.length).toBe(20 + baseQuestionLen);

          for (const q of body.data) {
            expect(q).toHaveProperty('questionId');
            expect(q).toHaveProperty('content');
            expect(q).toHaveProperty('isHidden');
            expect(q).toHaveProperty('createdAt');
          }
        });
    });

    it('유저가 작성한 질문이 없을 때 data에 빈 배열 응답', async () => {
      await testSetup.fixtures.cleanDatabase();
      const user = await testSetup.fixtures.userFactory.create();
      loginUserId = user.userId;
      testSetup.setUser({
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
      });

      const res = await request(app.getHttpServer())
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

      return res;
    });

    it('로그인한 유저와 조회 대상 유저가 다를 때 403 에러', () => {
      return request(app.getHttpServer())
        .get(`/users/${targetUserId}/questions`)
        .set('userId', loginUserId)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /users/:userId/messages', () => {
    const query = {
      type: 'sent',
      limit: 10,
      order: 'desc',
    };

    describe('유저가 보낸 쪽지 조회', () => {
      it('유저가 보낸 쪽지 조회', () => {
        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=${query.type}&limit=${query.limit}&order=${query.order}`)
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            const messageList = body.data.messageList as GetMySentMessagesDto[];
            // check all type

            for (const message of messageList) {
              expect(message).toHaveProperty('messageId');
              expect(message).toHaveProperty('receiverId');
              expect(message).toHaveProperty('receiverNickname');
              expect(message).toHaveProperty('content');
              expect(message).toHaveProperty('createdAt');
              expect(message).toHaveProperty('reactionInfo');
            }
          });
      });

      it('로그인한 유저와 조회 대상 유저가 다를 때 403 에러', () => {
        return request(app.getHttpServer())
          .get(`/users/${targetUserId}/messages?type=${query.type}&limit=${query.limit}&order=${query.order}`)
          .set('userId', loginUserId)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('query 에 올바르지 않은 값이 들어왔을 때 400 에러', () => {
        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=invalid&limit=invalid&order=invalid`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('query 에 limit 값이 30을 초과했을 때 400 에러', () => {
        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=${query.type}&limit=31&order=${query.order}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('(sent)cursor가 없을 때 가장 최근 메시지 조회', async () => {
        const messages = await testSetup.fixtures.messageFactory.createMany(20, {
          senderId: loginUserId,
          receiverId: targetUserId,
          emotionId: '1',
        });

        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=${query.type}&order=${query.order}`)
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList[0].messageId).toBe(messages[messages.length - 1].messageId);
          });
      });
      it('(sent)cursor가 있을 때 cursor 이전의 메시지 조회', async () => {
        const recentMessage = await testSetup.fixtures.messageFactory.create({
          senderId: loginUserId,
          receiverId: targetUserId,
          emotionId: '1',
        });

        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${recentMessage?.createdAt.toISOString()}`,
          )
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList[0].messageId).not.toBe(recentMessage?.messageId);
          });
      });

      it('(sent)마지막 페이지일 때 nextCursor가 null', async () => {
        const message = await testSetup.fixtures.messageFactory.create({
          senderId: loginUserId,
          receiverId: targetUserId,
          emotionId: '1',
        });
        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${message.createdAt.toISOString()}`,
          )
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList.length).toBe(1);
            expect(body.data.nextCursor).toBeNull();
          });
      });

      it('(sent)여러번 요청했을 때 정상적인 값이 오는지 확인', async () => {
        const totalMessages = await testSetup.fixtures.messageFactory.createMany(20, {
          senderId: loginUserId,
          receiverId: targetUserId,
          emotionId: '1',
        });

        const baseMessage = testData.messages.filter((m) => m.receiverId === loginUserId);

        const limit = 30;
        let totalResCount = 0;
        let cursor = undefined;
        for (; cursor !== null; ) {
          await request(app.getHttpServer())
            .get(
              `/users/${loginUserId}/messages?type=${query.type}&${cursor ? `cursor=${cursor}&` : ''}&limit=${limit}&order=${query.order}`,
            )
            .expect(HttpStatus.OK)
            .expect((response) => {
              const { body } = response;
              expect(response.body).toHaveProperty('data');
              expect(response.body).toHaveProperty('message');
              expect(response.body).toHaveProperty('status');

              expect(body.data.messageList).toBeInstanceOf(Array);
              expect(body.data.messageList.length).toBeLessThanOrEqual(limit);
              cursor = body.data.nextCursor;
              totalResCount += body.data.messageList.length;
            });
        }
        expect(totalResCount).toBe(totalMessages.length + baseMessage.length);
      });
    });

    describe('유저가 받은 쪽지 조회', () => {
      const query = {
        type: 'received',
        limit: 10,
        order: 'desc',
      };

      it('유저가 받은 쪽지 조회', () => {
        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=received&limit=${query.limit}&order=${query.order}`)
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            const messageList = body.data.messageList as GetMySentMessagesDto[];
            // check all type

            for (const message of messageList) {
              expect(message).toHaveProperty('messageId');
              expect(message).toHaveProperty('receiverId');
              expect(message).toHaveProperty('receiverNickname');
              expect(message).toHaveProperty('content');
              expect(message).toHaveProperty('createdAt');
              expect(message).toHaveProperty('status');
              expect(message).toHaveProperty('readAt');
            }
          });
      });

      it('cursor가 없을 때 가장 최근 메시지 조회', async () => {
        const recentMessage = await testSetup.fixtures.messageFactory.create({
          senderId: targetUserId,
          receiverId: loginUserId,
          emotionId: '1',
        });

        return request(app.getHttpServer())
          .get(`/users/${loginUserId}/messages?type=${query.type}&order=${query.order}`)
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList[0].messageId).toBe(recentMessage.messageId);
          });
      });

      it('cursor가 있을 때 cursor 이전의 메시지 조회', async () => {
        const recentMessage = await testSetup.fixtures.messageFactory.create({
          senderId: targetUserId,
          receiverId: loginUserId,
          emotionId: '1',
        });
        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${recentMessage?.createdAt.toISOString()}`,
          )
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList[0].messageId).not.toBe(recentMessage?.messageId);
          });
      });

      it('마지막 페이지일 때 nextCursor가 null', async () => {
        // 마지막 - 1 번째 message
        const message = await testSetup.fixtures.messageFactory.create({
          senderId: targetUserId,
          receiverId: loginUserId,
          emotionId: '1',
        });

        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${message.createdAt.toISOString()}`,
          )
          .expect(HttpStatus.OK)
          .expect((response) => {
            const { body } = response;
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');

            expect(body.data.messageList).toBeInstanceOf(Array);
            expect(body.data.messageList.length).toBe(1);
            expect(body.data.nextCursor).toBeNull();
          });
      });

      it('여러번 요청했을 때 정상적인 값이 오는지 확인', async () => {
        const totalMessages = await testSetup.fixtures.messageFactory.createMany(20, {
          senderId: targetUserId,
          receiverId: loginUserId,
          emotionId: '1',
        });
        const baseMessage = testData.messages.filter((m) => m.receiverId === loginUserId);
        const limit = query.limit;
        let totalResCount = 0;
        let cursor = undefined;
        for (; cursor !== null; ) {
          await request(app.getHttpServer())
            .get(
              `/users/${loginUserId}/messages?type=${query.type}&${cursor ? `cursor=${cursor}&` : ''}&limit=${limit}&order=${query.order}`,
            )
            .expect(HttpStatus.OK)
            .expect((response) => {
              const { body } = response;
              expect(response.body).toHaveProperty('data');
              expect(response.body).toHaveProperty('message');
              expect(response.body).toHaveProperty('status');

              expect(body.data.messageList).toBeInstanceOf(Array);
              expect(body.data.messageList.length).toBeLessThanOrEqual(limit);
              cursor = body.data.nextCursor;
              totalResCount += body.data.messageList.length;
            });
        }
        expect(totalResCount).toBe(totalMessages.length + baseMessage.length);
      });
    });
  });
});
