import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from '@modules/health/health.module';
import { CommonModule } from '@common/common.module';
import { RouterModule } from '@router/router.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/v1/auth/auth.module';

@Module({
  imports: [HealthModule, CommonModule, RouterModule.register(), ConfigModule.forRoot({
    isGlobal: true, // ConfigModule을 전역적으로 사용 (Error: Property 'configService' is declared but its value is never read.)
  }), AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
