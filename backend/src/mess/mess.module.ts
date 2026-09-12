import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MessController } from './mess.controller';
import { MessService } from './mess.service';

@Module({
  imports: [AuditModule],
  controllers: [MessController],
  providers: [MessService],
  exports: [MessService],
})
export class MessModule {}
