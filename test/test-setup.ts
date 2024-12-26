import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestingApp } from './helpers/create-testing-app.helper';
import { TestFixtureManager } from './helpers/fixtures';

export class TestSetup {
  public app: INestApplication;
  public dataSource: DataSource;
  public fixtures: TestFixtureManager;
  private currentUser: any = null;

  async init() {
    const { app, dataSource } = await createTestingApp();
    this.app = app;
    this.dataSource = dataSource;
    this.fixtures = new TestFixtureManager(dataSource);
    this.app.use((req: any, _: any, next: any) => {
      if (this.currentUser) {
        req.user = this.currentUser;
      }
      next();
    });

    await this.app.init();
    return this;
  }
  // 이 메서드로 테스트 중에 유저 변경 가능
  setUser(user: any) {
    this.currentUser = user;
  }

  async cleanup() {
    await this.dataSource.destroy();
    await this.app.close();
  }
}
