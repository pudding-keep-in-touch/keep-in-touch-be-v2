import { Emotion } from '@entities/emotion.entity';
import { Message } from '@entities/message.entity';
import { Question } from '@entities/question.entity';
import { GetMySentMessagesDto } from '@modules/users/dto/get-my-messages.dto';
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
    await questionRepository.delete({ userId: loginUserId });

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

    it('유저가 작성한 질문이 없을 때 data에 빈 배열 응답', async () => {
      await dataSource.getRepository(Question).delete({ userId: loginUserId });

      const questionsAfterDelete = await dataSource.getRepository(Question).find({ where: { userId: loginUserId } });
      expect(questionsAfterDelete.length).toBe(0); // 데이터 삭제 확인

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

      await dataSource.getRepository(Question).insert(insertQuestions);
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
        const recentMessage = await dataSource.getRepository(Message).findOne({
          where: {
            senderId: loginUserId,
          },
          order: { createdAt: 'DESC' },
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
            expect(body.data.messageList[0].messageId).toBe(recentMessage?.messageId);
          });
      });

      it('(sent)cursor가 있을 때 cursor 이전의 메시지 조회', async () => {
        const recentMessage = await dataSource.getRepository(Message).findOne({
          where: {
            senderId: loginUserId,
          },
          order: { createdAt: 'DESC' },
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
        const messages = await dataSource.getRepository(Message).find({
          where: {
            senderId: loginUserId,
          },
          order: { createdAt: 'ASC' },
          take: 2, // 과거 메시지 2개만 조회
        });

        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${messages[messages.length - 1].createdAt.toISOString()}`,
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
        const totalMessages = await dataSource
          .getRepository(Message)
          .find({ where: { senderId: loginUserId }, order: { createdAt: 'DESC' } });
        const total = totalMessages.length;
        let msgList: any[] = [];

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
              msgList.push(...body.data.messageList);
            });
        }
        const remainingMessages = totalMessages.filter(
          (msg) => !msgList.some((receivedMsg) => receivedMsg.messageId === msg.messageId),
        );
        expect(totalResCount).toBe(total);
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
        const recentMessage = await dataSource.getRepository(Message).findOne({
          where: {
            receiverId: loginUserId,
          },
          order: { createdAt: 'DESC' },
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
            expect(body.data.messageList[0].messageId).toBe(recentMessage?.messageId);
          });
      });

      it('cursor가 있을 때 cursor 이전의 메시지 조회', async () => {
        const recentMessage = await dataSource.getRepository(Message).findOne({
          where: {
            receiverId: loginUserId,
          },
          order: { createdAt: 'DESC' },
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
        const messages = await dataSource.getRepository(Message).find({
          where: {
            receiverId: loginUserId,
          },
          order: { createdAt: 'ASC' },
          take: 2, // 과거 메시지 2개만 조회
        });

        return request(app.getHttpServer())
          .get(
            `/users/${loginUserId}/messages?type=${query.type}&order=${query.order}&cursor=${messages[messages.length - 1].createdAt.toISOString()}`,
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
        const totalMessages = await dataSource
          .getRepository(Message)
          .find({ where: { receiverId: loginUserId }, order: { createdAt: 'DESC' } });
        const total = totalMessages.length;
        let msgList: any[] = [];

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
              msgList.push(...body.data.messageList);
            });
        }
        const remainingMessages = totalMessages.filter(
          (msg) => !msgList.some((receivedMsg) => receivedMsg.messageId === msg.messageId),
        );
        expect(totalResCount).toBe(total);
      });
    });
  });
});
