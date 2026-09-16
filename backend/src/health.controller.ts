import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  status() {
    return { ok: true, service: 'mess-api', time: new Date().toISOString() };
  }
}
