import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('take') take?: string) {
    return this.audit.list(user.messId ?? '', take ? Number(take) : 100);
  }
}
