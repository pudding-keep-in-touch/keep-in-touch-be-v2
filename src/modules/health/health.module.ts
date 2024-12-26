import { HealthController } from '@modules/health/health.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [HealthController],
})
export class HealthModule {}
