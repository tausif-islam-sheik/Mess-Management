import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.reports.list(user.messId ?? '');
  }

  @Post('generate')
  generate(@CurrentUser() user: RequestUser, @Body() body: { monthYear?: string }) {
    return this.reports.generate(user.messId ?? '', user.sub, body?.monthYear);
  }
}
