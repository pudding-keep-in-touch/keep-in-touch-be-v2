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
  });

  afterAll(async () => {
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
      });
  });
});
