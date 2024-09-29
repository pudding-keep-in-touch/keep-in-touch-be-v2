import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from '@modules/health/health.module';
import { CommonModule } from '@common/common.module';
import { RouterModule } from '@router/router.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@configs/process-env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: validateEnv,
      isGlobal: true
    }),
    HealthModule,
    CommonModule,
    RouterModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
