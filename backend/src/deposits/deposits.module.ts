import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

@Module({
  imports: [AuditModule],
  controllers: [DepositsController],
  providers: [DepositsService],
})
export class DepositsModule {}
