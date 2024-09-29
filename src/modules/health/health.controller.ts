import { NotUserAuth } from '@common/common.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @NotUserAuth()
  @Get()
  async check() {
    return {
      status: true,
      app_env: process.env.APP_ENV ?? 'local',
      current_date: new Date().toLocaleString(),
    };
  }
}
