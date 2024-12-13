import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      load: loadConfigs,
      validationSchema: validateEnv,
    }),
  ],
  providers: [AppConfigService, GoogleConfigService, KakaoConfigService, PostgresConfigService, JwtConfigService],
  exports: [AppConfigService, GoogleConfigService, KakaoConfigService, PostgresConfigService, JwtConfigService],
})
export class RootConfigModule {}
