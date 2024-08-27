import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from '@modules/health/health.module';
import { CommonModule } from '@common/common.module';
import { MessagesModule } from '@modules/v1/messages/messages.module';
@Module({
  imports: [HealthModule, CommonModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
