import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';

@Module({
  imports: [AuditModule],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
