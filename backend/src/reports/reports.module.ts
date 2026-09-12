import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MessModule } from '../mess/mess.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [AuditModule, MessModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
