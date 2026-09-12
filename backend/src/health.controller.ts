import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  status() {
    return { ok: true, service: 'mess-api', time: new Date().toISOString() };
  }
}
