import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from '@modules/health/health.module';
import { CommonModule } from '@common/common.module';
import { RouterModule } from '@router/router.module';

@Module({
  imports: [HealthModule, CommonModule, RouterModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
