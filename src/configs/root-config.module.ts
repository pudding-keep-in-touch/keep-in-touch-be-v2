import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppConfigService } from './app/app-config.service';
import { GoogleConfigService } from './google/google-config.service';
import { JwtConfigService } from './jwt/jwt-config.service';
import { KakaoConfigService } from './kakao/kakao-config.service';
import { loadConfigs } from './load-configs';
import { PostgresConfigService } from './postgres/postgres-config.service';
import { validateEnv } from './validate-env.config';

@Global() // global module
@Module({
  imports: [
    ConfigModule.forRoot({
      // NODE_ENV=local, test 로 실행하는 로컬 및 테스트 환경에서 특정 파일을 로드하기 위함.
      // production, development 환경에서는 .env 파일을 로드함. (NODE_ENV 지정하지 않음)
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      load: loadConfigs,
      validationSchema: validateEnv,
    }),
  ],
  providers: [
    ConfigService,
    AppConfigService,
    GoogleConfigService,
    KakaoConfigService,
    PostgresConfigService,
    JwtConfigService,
  ],
  exports: [
    ConfigService,
    AppConfigService,
    GoogleConfigService,
    KakaoConfigService,
    PostgresConfigService,
    JwtConfigService,
  ],
})
export class RootConfigModule {}
