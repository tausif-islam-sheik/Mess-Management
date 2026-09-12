import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CostsController } from './costs.controller';
import { CostsService } from './costs.service';

@Module({
  imports: [AuditModule],
  controllers: [CostsController],
  providers: [CostsService],
})
export class CostsModule {}
