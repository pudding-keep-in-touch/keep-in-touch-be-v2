import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 소켓 연결
    // socket = io('http://localhost:3000');
    // socket.on('connect', () => {
    //   console.log('소켓 연결 성공');
    // });
  });

  afterAll(async () => {
    // 소켓이 연결된 상태일 때만 연결 해제
    // if (socket && socket.connected) {
    //   console.log('소켓 열려있음');

    //   socket.on('disconnect', () => {
    //     console.log('소켓 정상적으로 닫힘');
    //   });

    //   /// close 대신 disconnect
    //   socket.disconnect();
    // } else {
    //   console.log('이미 소켓 끊김');
    // }

    console.log('앱 닫기');
    await app.close();
  });

  it('쪽지 상세 조회', (done) => {
    request(app.getHttpServer())
      .get('/v1/direct-messages/5')
      .expect(200)
      .expect((res) => {
        console.log(res);
      })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  it('쪽지 전송하기', (done) => {
    let receiverId: number;

    request(app.getHttpServer())
      .post('/v1/direct-messages')
      .send({
        sender_id: 1,
        receiver_email: 'testuser2@test.com',
        emotion_name: '응원과 감사',
        content: '토이 3팀 손절보안관 울트라 캡숑 짱짱',
      })
      .expect(201)
      .end((err, res) => {
        console.log('201 end: ', res.body);
        if (err) return done(err);

        receiverId = res.body.data.receiverId;

        console.log('receiverId: ', receiverId);
        expect(res.body.message).toBe('쪽지 전송 성공');

        // 삭제 예정
        done();

        // 소켓 연결 후 새로운 쪽지 도착 알람을 서버에 요청
        // socket.emit('newDm', receiverId);

        // 알람 도착하면 테스트 종료
        //   socket.on('notification', (message) => {
        //     console.log('notification message:', message);
        //     try {
        //       expect(message).toContain('새로운 쪽지가 도착했습니다');

        //       done();
        //     } catch (error) {
        //       done(error);
        //     }
        //   });

        //   socket.on('connect_error', (error) => {
        //     console.error('소켓 연결 실패:', error);

        //     done(error); // 에러가 발생하면 테스트를 실패 처리
        //   });
        // });

        // request(app.getHttpServer())
        //   .post('/v1/direct-messages')
        //   .send({ sender_id: 1, receiver_email: 'invalidEmail@test.com', emotion_name: '응원과 감사', content: '토이 3팀 손절보안관 울트라 캡숑 짱짱' })
        //   .expect(400)
        //   .end((err, res) => {
        //     console.log('400 end: ', res.body);
        //     if (err) return done(err);
        //     expect(res.body.message).toBe('받는 사람을 찾을 수 없습니다.');
        //     // done();
      });
  });
});
