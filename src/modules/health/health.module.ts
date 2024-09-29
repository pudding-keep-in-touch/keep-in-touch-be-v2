import { Module } from '@nestjs/common';
import { HealthController } from '@modules/health/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
})
export class HealthModule {}
